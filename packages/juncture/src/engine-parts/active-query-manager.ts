/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { isJuncture } from '../juncture';
import { ControlledActiveQueryCursor } from '../operation/frame-equipment/active-query-cursor';
import { Cursor } from '../operation/frame-equipment/cursor';
import { ControlledActiveQueryFrame } from '../operation/frames/active-query-frame';
import { createUnboundFrame } from '../operation/frames/unbound-frame';
import {
  ActiveQuery, isActiveQueryExplicitRequest, isActiveQueryRequest, isActiveQueryRunRequest
} from '../query/active-query';
import { QueryItem } from '../query/query';
import { BranchConfig } from './branch-manager';

export class ActiveQueryManager {
  constructor(
    protected readonly mountBranches: (configsToMount: BranchConfig[]) => string[],
    protected readonly unmountBranches: (keysToUnmount: string[]) => void,
    protected readonly getXpCursorFromQueryItem: (item: QueryItem) => Cursor | undefined
  ) { }

  // List of current cursors
  protected readonly controlledCursors = new Set<ControlledActiveQueryCursor>();

  protected createControlledCursor<Q extends ActiveQuery>(query: Q): ControlledActiveQueryCursor<Q> {
    const keys = Object.keys(query);

    // First step: mount temporary branches
    const configsToMount: BranchConfig[] = [];
    const keysWithMountIndexes = keys.map(key => {
      const item = query[key];
      if (isActiveQueryRunRequest(item)) {
        const index = configsToMount.push({
          juncture: item.run,
          key: item.branchKey,
          initialValue: item.initialValue
        }) - 1;
        return { key, index };
      }
      return { key, index: undefined };
    });
    const tempBranchKeys = this.mountBranches(configsToMount);

    // Second step: create cursor
    const cursor: any = {};
    keysWithMountIndexes.forEach(({ key, index }) => {
      const item = query[key];

      let value: any;
      if (isJuncture(item)) {
        value = this.getXpCursorFromQueryItem({ get: item });
      } else if (isActiveQueryRunRequest(item)) {
        value = this.getXpCursorFromQueryItem({
          get: tempBranchKeys[index!]
        });
      } else if (isActiveQueryRequest(item) || isActiveQueryExplicitRequest(item)) {
        value = this.getXpCursorFromQueryItem(item);
      } else {
        throw Error(`Unable to find a cursor for the ActiveQueryItem #${index}`);
      }

      cursor[key] = value;
    });

    // Step 3: Create controlled cursor and register it in the current list
    const controlledCursor: ControlledActiveQueryCursor = {
      cursor,
      release: () => {
        this.unmountBranches(tempBranchKeys);
        this.controlledCursors.delete(controlledCursor);
      }
    };
    this.controlledCursors.add(controlledCursor);

    return controlledCursor as any;
  }

  // TODO: implement in a better way
  releaseAllCursors() {
    const controlledCursors = Array.from(this.controlledCursors.values());
    controlledCursors.forEach(controlledCursor => {
      controlledCursor.release();
    });
  }

  createControlledFrame<Q extends ActiveQuery>(query: Q): ControlledActiveQueryFrame<Q> {
    const controlledCursor = this.createControlledCursor(query);
    return {
      frame: createUnboundFrame(controlledCursor.cursor),
      release: controlledCursor.release
    };
  }
}
