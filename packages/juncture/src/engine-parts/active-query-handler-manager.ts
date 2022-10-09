/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EngineActiveQueryHandlerMediator } from '../engine';
import { ActiveQueryHandler } from '../query/active-query-handler';

export class ActiveQueryHandlerManager {
  constructor(
    protected readonly mediator: EngineActiveQueryHandlerMediator
  ) { }

  protected readonly handlers = new Set<ActiveQueryHandler>();

  // TODO: implement dismiss logic & auto update logic for change of dependencies
  createHandler(): ActiveQueryHandler {
    const handler = new ActiveQueryHandler(this.mediator);
    this.handlers.add(handler);
    return handler;
  }
}
