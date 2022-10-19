/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { filter, Observable, takeWhile } from 'rxjs';
import { isJuncture } from '../juncture';
import { Cursor } from '../operation/frame-equipment/cursor';
import { ActiveQueryFrame, createActiveQueryFrame } from '../operation/frames/active-query-frame';
import { PersistentPath } from '../operation/path';
import {
  ActiveQuery, isActiveQueryExplicitRequest, isActiveQueryRequest, isActiveQueryRunRequest
} from '../query/active-query';
import { QueryItem } from '../query/query';
import { BranchConfig } from './branch-manager';
import { ValueUsageCassette } from './value-usage-recorder';

export interface ActiveQueryFrameHandler<Q extends ActiveQuery = ActiveQuery> {
  readonly frame: ActiveQueryFrame<Q>;
  readonly valueMutationAck$: Observable<PersistentPath>;
  clearValueUsageCassette(): void;
  release(): void;
}

interface ActiveQueryFrameHandlerTearDownData {
  isActive: boolean,
  tempBranchIds: string[]
}

export class ActiveQueryManager {
  constructor(
    protected readonly mountBranches: (configsToMount: BranchConfig[]) => string[],
    protected readonly unmountBranches: (keysToUnmount: string[]) => void,
    protected readonly getXpCursorFromQueryItem: (item: QueryItem) => Cursor | undefined,
    protected readonly useValueUsageCassette: (cassette: ValueUsageCassette) => void,
    protected readonly ejectValueUsageCassette: () => void,
    protected readonly valueMutationAck$: Observable<PersistentPath>
  ) { }

  protected readonly tearDownDatas = new Map<ActiveQueryFrameHandler, ActiveQueryFrameHandlerTearDownData>();

  createHandler<Q extends ActiveQuery>(query: Q): ActiveQueryFrameHandler<Q> {
    const keys = Object.keys(query);

    // Step 1: mount temporary branches
    const configsToMount: BranchConfig[] = [];
    const keysWithMountIndexes = keys.map(key => {
      const item = query[key];
      if (isActiveQueryRunRequest(item)) {
        const index = configsToMount.push({
          juncture: item.run,
          id: item.branchId,
          initialValue: item.initialValue
        }) - 1;
        return { key, index };
      }
      return { key, index: undefined };
    });
    const tempBranchIds = this.mountBranches(configsToMount);

    // Step 2: create cursor
    const cursor: any = {};
    keysWithMountIndexes.forEach(({ key, index }) => {
      const item = query[key];

      let value: any;
      if (isJuncture(item)) {
        value = this.getXpCursorFromQueryItem({ get: item });
      } else if (isActiveQueryRunRequest(item)) {
        value = this.getXpCursorFromQueryItem({
          get: tempBranchIds[index!]
        });
      } else if (isActiveQueryRequest(item) || isActiveQueryExplicitRequest(item)) {
        value = this.getXpCursorFromQueryItem(item);
      } else {
        throw Error(`Unable to find a cursor for the ActiveQueryItem #${index}`);
      }

      cursor[key] = value;
    });

    // Step 3: Create the value usage cassette
    const cassette = this.createValueUsageCassette();

    // Step 4: Create the frame
    const inspector = (isStart: boolean) => {
      if (isStart) {
        this.useValueUsageCassette(cassette);
      } else {
        this.ejectValueUsageCassette();
      }
    };
    const frame = createActiveQueryFrame(cursor, inspector);

    // Step 5: register handler data for tear down
    const tearDownData: ActiveQueryFrameHandlerTearDownData = {
      isActive: true,
      tempBranchIds
    };

    // Step 6: Create the handler
    const handler: ActiveQueryFrameHandler = {
      frame,
      valueMutationAck$: this.valueMutationAck$.pipe(
        takeWhile(() => tearDownData.isActive),
        filter(path => cassette.has(path))
      ),
      clearValueUsageCassette: () => {
        cassette.clear();
      },
      release: () => {
        if (!tearDownData.isActive) {
          return;
        }
        tearDownData.isActive = false;
        cassette.clear();
        this.unmountBranches(tempBranchIds);
        this.tearDownDatas.delete(handler);
      }
    };

    return handler as any;
  }

  releaseAll() {
    const datas = Array.from(this.tearDownDatas.values());
    // Stop all valueMutationAck$
    datas.forEach(data => {
      // eslint-disable-next-line no-param-reassign
      data.isActive = false;
    });

    // Unmount all temp branches at the same time
    const tempBranchIds = datas.reduce((acc, data) => acc.concat(data.tempBranchIds), [] as string[]);
    this.unmountBranches(tempBranchIds);

    this.tearDownDatas.clear();
  }

  // eslint-disable-next-line class-methods-use-this
  protected createValueUsageCassette(): ValueUsageCassette {
    return new Set<PersistentPath>();
  }
}
