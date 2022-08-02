/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import { Ctx } from './ctx';
import { addCtxLink } from './ctx-host';
import { Path } from './path';

export interface CtxRef extends Path {
  [jSymbols.ctx]: Ctx;
}

export function createCtxRef(ctx: Ctx): CtxRef {
  const ref: any = [...ctx.layout.path];
  return addCtxLink(ref, ctx);
}
