/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-lonely-if */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable no-case-declarations */
/* eslint-disable default-case */

import { EngineActiveQueryHandlerMediator } from '../engine';
import { BranchConfig } from '../engine-parts/branch-manager';
import { Juncture } from '../juncture';
import { Cursor } from '../operation/frame-equipment/cursor';
import { comparePaths, Path, PathComparisonResult } from '../operation/path';
import {
    ActiveQuery, ActiveQueryItem, ActiveQueryItemType, ActiveQueryRequest, ActiveQueryRunRequest, getActiveQueryItemType
} from './active-query';
import { getQuerySourceType, QuerySourceType } from './query-source';

interface Data {
  item: ActiveQueryItem;
  type: ActiveQueryItemType,
  _: Cursor | undefined | null; // Undefined for optional dependencies, null => must recalculate
  tempMountIndex: number | undefined;
  tempBranchKey: string | undefined;
}

export class ActiveQueryHandler {
  readonly cursor: any = {};

  protected datas = new Map<string, Data>();

  protected _isActive = true;

  constructor(protected readonly mediator: EngineActiveQueryHandlerMediator) {}

  get isActive() {
    return this._isActive;
  }

  protected checkActive() {
    if (!this.isActive) {
      throw Error('ActiveQueryHandler already dismissed');
    }
  }

  protected isTemporaryJunctureRequestChanged(
    oldItem: ActiveQueryRunRequest,
    newItem: ActiveQueryRunRequest
  ): boolean {
    if (newItem.run !== oldItem.run) {
      return true;
    }
    if (newItem.branchKey !== oldItem.branchKey) {
      return true;
    }
    return false;
  }

  protected isJunctureRequestChanged(
    oldItem: ActiveQueryRequest,
    newItem: ActiveQueryRequest
  ): boolean {
    if (newItem.get !== oldItem.get) {
      return true;
    }
    if (newItem.optional !== oldItem.optional) {
      return true;
    }

    const oldItemSourceType = oldItem.from !== undefined ? getQuerySourceType(oldItem.from) : undefined;
    const newItemSourceType = newItem.from !== undefined ? getQuerySourceType(newItem.from) : undefined;
    if (oldItemSourceType !== newItemSourceType) {
      return true;
    }
    switch (newItemSourceType) {
      case QuerySourceType.branchKey:
      case QuerySourceType.cursor:
        if (newItem.from !== oldItem.from) {
          return true;
        }
        break;
      case QuerySourceType.path:
        if (comparePaths(newItem.from as Path, oldItem.from as Path) !== PathComparisonResult.equal) {
          return true;
        }
    }
    return false;
  }

  protected keysToRemove: string[] = [];

  protected keysToUnmount: string[] = [];

  protected configsToMount: BranchConfig[] = [];

  update<Q extends ActiveQuery>(query: Q) {
    this.checkActive();
    const { datas, cursor } = this;
    const keys = Object.keys(query);

    const { keysToRemove, keysToUnmount, configsToMount } = this;
    // Iterate old keys
    datas.forEach((data, key) => {
      const index = keys.indexOf(key);
      if (index !== -1) {
        // Old key present in new query
        const newItem = query[key];
        const newType = getActiveQueryItemType(newItem);
        if (newType === data.type) {
          // Same type
          switch (data.type) {
            case ActiveQueryItemType.juncture:
              if (newItem !== data.item) {
                // Juncture changed
                data._ = null;
              }
              break;
            case ActiveQueryItemType.runRequest:
              if (this.isTemporaryJunctureRequestChanged(
                data.item as ActiveQueryRunRequest,
                newItem as ActiveQueryRunRequest
              )) {
                // Change detected, remount required
                data._ = null;
                keysToUnmount.push(data.tempBranchKey!);
                data.tempMountIndex = configsToMount.push({
                  juncture: (newItem as ActiveQueryRunRequest).run,
                  key: (newItem as ActiveQueryRunRequest).branchKey,
                  initialValue: (newItem as ActiveQueryRunRequest).initialValue
                });
              }
              break;
            case ActiveQueryItemType.request:
              if (this.isJunctureRequestChanged(
                data.item as ActiveQueryRequest,
                newItem as ActiveQueryRequest
              )) {
                // Change detected
                data._ = null;
              }
              break;
          }
        } else {
          // Type changed
          data._ = null;
          if (data.type === ActiveQueryItemType.runRequest) {
            keysToUnmount.push(data.tempBranchKey!);
            data.tempBranchKey = undefined;
          }
          if (newType === ActiveQueryItemType.runRequest) {
            data.tempMountIndex = configsToMount.push({
              juncture: (newItem as ActiveQueryRunRequest).run,
              key: (newItem as ActiveQueryRunRequest).branchKey,
              initialValue: (newItem as ActiveQueryRunRequest).initialValue
            });
          }
        }

        data.type = newType;
        data.item = newItem;
      } else {
        // Old key not present in new query
        keysToRemove.push(key);
        delete cursor[key];
        if (data.type === ActiveQueryItemType.runRequest) {
          keysToUnmount.push(data.tempBranchKey!);
        }
      }
    });
    // Add new keys
    keys.forEach(key => {
      if (!datas.has(key)) {
        const item = query[key];
        const type = getActiveQueryItemType(item);
        let tempMountIndex: number | undefined;
        if (type === ActiveQueryItemType.runRequest) {
          tempMountIndex = configsToMount.push({
            juncture: (item as ActiveQueryRunRequest).run,
            key: (item as ActiveQueryRunRequest).branchKey,
            initialValue: (item as ActiveQueryRunRequest).initialValue
          });
        }
        const data: Data = {
          item,
          type,
          _: null,
          tempMountIndex,
          tempBranchKey: undefined
        };
        datas.set(key, data);
      }
    });
    keysToRemove.forEach(key => datas.delete(key));

    // Sync branches and associate new branch keys with items
    const branchKeys = this.mediator.syncBranches(keysToUnmount, configsToMount);
    datas.forEach(data => {
      if (data.tempMountIndex !== undefined) {
        data.tempBranchKey = branchKeys[data.tempMountIndex - 1];
        data.tempMountIndex = undefined;
      }
    });

    // Calculate new cursors
    datas.forEach((data, key) => {
      if (data._ !== null) {
        return;
      }
      switch (data.type) {
        case ActiveQueryItemType.juncture:
          data._ = this.mediator.getXpCursorFromQueryItem({
            get: data.item as Juncture
          });
          break;
        case ActiveQueryItemType.runRequest:
          data._ = this.mediator.getXpCursorFromQueryItem({
            get: data.tempBranchKey!
          });
          break;
        case ActiveQueryItemType.request:
          data._ = this.mediator.getXpCursorFromQueryItem({
            get: (data.item as ActiveQueryRequest).get,
            from: (data.item as ActiveQueryRequest).from,
            optional: (data.item as ActiveQueryRequest).optional
          });
          break;
      }
      cursor[key] = data._;
    });

    keysToRemove.length = 0;
    keysToUnmount.length = 0;
    configsToMount.length = 0;
  }

  dismiss() {
    this.checkActive();

    this._isActive = false;
    (this as any).cursor = {};
    this.datas.clear();
  }
}
