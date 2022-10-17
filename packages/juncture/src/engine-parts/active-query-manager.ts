/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { isJuncture } from '../juncture';
import { Cursor } from '../operation/frame-equipment/cursor';
import { ActiveQueryFrame } from '../operation/frames/active-query-frame';
import { createUnboundFrame } from '../operation/frames/unbound-frame';
import {
  ActiveQuery, isActiveQueryExplicitRequest, isActiveQueryRequest, isActiveQueryRunRequest
} from '../query/active-query';
import { QueryItem } from '../query/query';
import { BranchConfig } from './branch-manager';

export interface ActiveQueryFrameHandler<Q extends ActiveQuery = ActiveQuery> {
  readonly frame: ActiveQueryFrame<Q>;
  release(): void;
}

export class ActiveQueryManager {
  constructor(
    protected readonly mountBranches: (configsToMount: BranchConfig[]) => string[],
    protected readonly unmountBranches: (keysToUnmount: string[]) => void,
    protected readonly getXpCursorFromQueryItem: (item: QueryItem) => Cursor | undefined
  ) { }

  protected readonly handlers = new Map<ActiveQueryFrameHandler, string[]>();

  createHandler<Q extends ActiveQuery>(query: Q): ActiveQueryFrameHandler<Q> {
    const keys = Object.keys(query);

    // Step 1: mount temporary branches
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

    // Step 2: create cursor
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

    // Step 3: Create the frame
    const frame = createUnboundFrame(cursor);

    // Step 4: Create the handler and register it
    const handler: ActiveQueryFrameHandler = {
      frame,
      release: () => {
        this.unmountBranches(tempBranchKeys);
        this.handlers.delete(handler);
      }
    };
    this.handlers.set(handler, tempBranchKeys);

    return handler as any;
  }

  releaseAll() {
    const tempBranchKeys2 = Array.from(this.handlers.values());
    const tempBranchKeys = tempBranchKeys2.reduce((acc, val) => acc.concat(val), []);

    this.unmountBranches(tempBranchKeys);
  }
}
