/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EngineDynamicQueryHandlerMediator } from '../engine';
import { DynamicQueryHandler } from '../queries/dynamic-query-handler';

export class DynamicQueryHandlerManager {
  constructor(
    protected readonly mediator: EngineDynamicQueryHandlerMediator
  ) { }

  protected readonly handlers = new Set<DynamicQueryHandler>();

  // TODO: implement dismiss logic & auto update logic for change of dependencies
  createHandler(): DynamicQueryHandler {
    const handler = new DynamicQueryHandler(this.mediator);
    this.handlers.add(handler);
    return handler;
  }
}
