/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Schema } from '../definition/schema';
import { Ctx, CtxConfig } from './ctx';

export class CtxHub {
  readonly schema: Schema;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(readonly ctx: Ctx, config: CtxConfig) {
    this.schema = ctx.schema;
  }

  // eslint-disable-next-line class-methods-use-this
  resolve(key: any): Ctx {
    throw Error(`Unable to resolve child Ctx with key: ${key}`);
  }
}
