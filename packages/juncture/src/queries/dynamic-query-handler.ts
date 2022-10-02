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

import { EngineDynamicQueryHandlerMediator } from '../engine';
import { BranchConfig } from '../engine-parts/branch-manager';
import { Juncture } from '../juncture';
import { Cursor } from '../operation/frame-equipment/cursor';
import { comparePaths, Path, PathComparisonResult } from '../operation/path';
import {
  DynamicQuery, DynamicQueryItem, DynamicQueryItemType, DynamicQueryJunctureRequest, DynamicQueryTemporaryJunctureRequest, getDynamicQueryItemType
} from './dynamic-query';
import { getQueryItemSourceType, QueryItemSourceType } from './query';

interface Data {
  item: DynamicQueryItem;
  type: DynamicQueryItemType,
  _: Cursor | undefined | null; // Undefined for optional dependencies, null => must recalculate
  tempMountIndex: number | undefined;
  tempBranchKey: string | undefined;
}

export class DynamicQueryHandler {
  readonly cursor: any = {};

  protected datas = new Map<string, Data>();

  protected _isActive = true;

  constructor(protected readonly mediator: EngineDynamicQueryHandlerMediator) {}

  get isActive() {
    return this._isActive;
  }

  protected checkActive() {
    if (!this.isActive) {
      throw Error('DynamicQueryHandler already dismissed');
    }
  }

  protected isTemporaryJunctureRequestChanged(
    oldItem: DynamicQueryTemporaryJunctureRequest,
    newItem: DynamicQueryTemporaryJunctureRequest
  ): boolean {
    if (newItem.temporaryJuncture !== oldItem.temporaryJuncture) {
      return true;
    }
    if (newItem.branchKey !== oldItem.branchKey) {
      return true;
    }
    return false;
  }

  protected isJunctureRequestChanged(
    oldItem: DynamicQueryJunctureRequest,
    newItem: DynamicQueryJunctureRequest
  ): boolean {
    if (newItem.juncture !== oldItem.juncture) {
      return true;
    }
    if (newItem.optional !== oldItem.optional) {
      return true;
    }

    const oldItemSourceType = oldItem.source !== undefined ? getQueryItemSourceType(oldItem.source) : undefined;
    const newItemSourceType = newItem.source !== undefined ? getQueryItemSourceType(newItem.source) : undefined;
    if (oldItemSourceType !== newItemSourceType) {
      return true;
    }
    switch (newItemSourceType) {
      case QueryItemSourceType.string:
      case QueryItemSourceType.cursor:
        if (newItem.source !== oldItem.source) {
          return true;
        }
        break;
      case QueryItemSourceType.path:
        if (comparePaths(newItem.source as Path, oldItem.source as Path) !== PathComparisonResult.equal) {
          return true;
        }
    }
    return false;
  }

  protected keysToRemove: string[] = [];

  protected keysToUnmount: string[] = [];

  protected configsToMount: BranchConfig[] = [];

  update<Q extends DynamicQuery>(query: Q) {
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
        const newType = getDynamicQueryItemType(newItem);
        if (newType === data.type) {
          // Same type
          switch (data.type) {
            case DynamicQueryItemType.juncture:
              if (newItem !== data.item) {
                // Juncture changed
                data._ = null;
              }
              break;
            case DynamicQueryItemType.temporaryJunctureRequest:
              if (this.isTemporaryJunctureRequestChanged(
                data.item as DynamicQueryTemporaryJunctureRequest,
                newItem as DynamicQueryTemporaryJunctureRequest
              )) {
                // Change detected, remount required
                data._ = null;
                keysToUnmount.push(data.tempBranchKey!);
                data.tempMountIndex = configsToMount.push({
                  juncture: (newItem as DynamicQueryTemporaryJunctureRequest).temporaryJuncture,
                  key: (newItem as DynamicQueryTemporaryJunctureRequest).branchKey,
                  initialValue: (newItem as DynamicQueryTemporaryJunctureRequest).initialValue
                });
              }
              break;
            case DynamicQueryItemType.junctureRequest:
              if (this.isJunctureRequestChanged(
                data.item as DynamicQueryJunctureRequest,
                newItem as DynamicQueryJunctureRequest
              )) {
                // Change detected
                data._ = null;
              }
              break;
          }
        } else {
          // Type changed
          data._ = null;
          if (data.type === DynamicQueryItemType.temporaryJunctureRequest) {
            keysToUnmount.push(data.tempBranchKey!);
            data.tempBranchKey = undefined;
          }
          if (newType === DynamicQueryItemType.temporaryJunctureRequest) {
            data.tempMountIndex = configsToMount.push({
              juncture: (newItem as DynamicQueryTemporaryJunctureRequest).temporaryJuncture,
              key: (newItem as DynamicQueryTemporaryJunctureRequest).branchKey,
              initialValue: (newItem as DynamicQueryTemporaryJunctureRequest).initialValue
            });
          }
        }

        data.type = newType;
        data.item = newItem;
      } else {
        // Old key not present in new query
        keysToRemove.push(key);
        delete cursor[key];
        if (data.type === DynamicQueryItemType.temporaryJunctureRequest) {
          keysToUnmount.push(data.tempBranchKey!);
        }
      }
    });
    // Add new keys
    keys.forEach(key => {
      if (!datas.has(key)) {
        const item = query[key];
        const type = getDynamicQueryItemType(item);
        let tempMountIndex: number | undefined;
        if (type === DynamicQueryItemType.temporaryJunctureRequest) {
          tempMountIndex = configsToMount.push({
            juncture: (item as DynamicQueryTemporaryJunctureRequest).temporaryJuncture,
            key: (item as DynamicQueryTemporaryJunctureRequest).branchKey,
            initialValue: (item as DynamicQueryTemporaryJunctureRequest).initialValue
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
        case DynamicQueryItemType.juncture:
          data._ = this.mediator.getXpCursorFromQueryItem({
            juncture: data.item as Juncture
          });
          break;
        case DynamicQueryItemType.temporaryJunctureRequest:
          data._ = this.mediator.getXpCursorFromQueryItem({
            source: data.tempBranchKey!
          });
          break;
        case DynamicQueryItemType.junctureRequest:
          data._ = this.mediator.getXpCursorFromQueryItem({
            juncture: (data.item as DynamicQueryJunctureRequest).juncture,
            source: (data.item as DynamicQueryJunctureRequest).source,
            optional: (data.item as DynamicQueryJunctureRequest).optional
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
