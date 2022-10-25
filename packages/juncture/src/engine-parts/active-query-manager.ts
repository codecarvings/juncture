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
import { createXpApplicationCassette, XpApplicationCassette } from './application-recorder';
import { ServiceConfig } from './service-manager';

export interface ActiveQueryFrameHandler<Q extends ActiveQuery = ActiveQuery> {
  readonly frame: ActiveQueryFrame<Q>;
  readonly valueMutationAck$: Observable<PersistentPath>;
  insertCassette(): void;
  ejectCassette(): void;
  eraseCassette(): void;
  dismiss(): void;
}

export class ActiveQueryManager {
  constructor(
    protected readonly startServices: (configs: ServiceConfig[]) => string[],
    protected readonly stopServices: (ids: string[]) => void,
    protected readonly getXpCursorFromQueryItem: (item: QueryItem) => Cursor | undefined,
    protected readonly insertApplicationCassette: (cassette: XpApplicationCassette) => void,
    protected readonly ejectApplicationCassette: () => void,
    protected readonly valueMutationAck$: Observable<PersistentPath>
  ) { }

  protected readonly handlers = new Set<ActiveQueryFrameHandler>();

  createHandler<Q extends ActiveQuery>(query: Q): ActiveQueryFrameHandler<Q> {
    const keys = Object.keys(query);

    // Step 1: start temporary services
    const configsToStart: ServiceConfig[] = [];
    const keysWithStartIndex = keys.map(key => {
      const item = query[key];
      if (isActiveQueryRunRequest(item)) {
        const index = configsToStart.push({
          juncture: item.run,
          id: item.serviceId,
          initialValue: item.initialValue
        }) - 1;
        return { key, index };
      }
      return { key, index: undefined };
    });
    const tempServiceIds = this.startServices(configsToStart);

    // Step 2: Get the cursor
    const cursor: any = {};
    keysWithStartIndex.forEach(({ key, index }) => {
      const item = query[key];

      let value: any;
      if (isJuncture(item)) {
        value = this.getXpCursorFromQueryItem({ get: item });
      } else if (isActiveQueryRunRequest(item)) {
        value = this.getXpCursorFromQueryItem({
          get: tempServiceIds[index!]
        });
      } else if (isActiveQueryRequest(item) || isActiveQueryExplicitRequest(item)) {
        value = this.getXpCursorFromQueryItem(item);
      } else {
        throw Error(`Unable to find a cursor for the ActiveQueryItem #${index}.`);
      }

      cursor[key] = value;
    });

    // Step 3: Create the application cassette
    const cassette = this.createApplicationCassette();

    // Step 4: Create the frame
    const frame = createActiveQueryFrame(cursor);

    // Step 5: Create the handler and register it
    let isActive = true;
    const handler: ActiveQueryFrameHandler = {
      frame,
      valueMutationAck$: this.valueMutationAck$.pipe(
        takeWhile(() => isActive),
        filter(path => cassette.values.has(path))
      ),
      insertCassette: () => {
        this.insertApplicationCassette(cassette);
      },
      ejectCassette: this.ejectApplicationCassette,
      eraseCassette: () => {
        cassette.erase();
      },
      dismiss: () => {
        if (!isActive) {
          return;
        }
        isActive = false;
        cassette.erase();
        this.stopServices(tempServiceIds);
        this.handlers.delete(handler);
      }
    };
    this.handlers.add(handler);

    return handler as any;
  }

  stop() {
    const handlers = Array.from(this.handlers.values());
    handlers.forEach(handler => {
      handler.dismiss();
    });
  }

  // eslint-disable-next-line class-methods-use-this
  protected createApplicationCassette(): XpApplicationCassette {
    return createXpApplicationCassette();
  }
}
