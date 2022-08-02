/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import { Ctx } from './ctx';

export interface CtxHost {
  [jSymbols.ctx]: Ctx;
}

export function addCtxLink(container: any, ctx: Ctx) {
  // eslint-disable-next-line no-param-reassign
  container[jSymbols.ctx] = ctx;
  return container;
}

export function getCtx(host: CtxHost): Ctx {
  return host[jSymbols.ctx];
}

// Used in tests
export function isCtxHost(obj: any): obj is CtxHost;
export function isCtxHost(obj: any, ctx: Ctx): obj is CtxHost;
export function isCtxHost(obj: any, ctx?: Ctx) {
  if (!obj) {
    return false;
  }
  if (ctx !== undefined) {
    return obj[jSymbols.ctx] === ctx;
  }
  return obj[jSymbols.ctx] instanceof Ctx;
}
