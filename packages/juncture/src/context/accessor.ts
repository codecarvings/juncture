/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Ctx } from './ctx';
import { getCtx } from './ctx-host';
import { Cursor } from './cursor';
import { BinKit } from './kits/bin-kit';

export function createAccessorFactory(binKey: keyof BinKit): any {
  return (defaultCtx: Ctx) => (_?: Cursor) => {
    const ctx = typeof _ !== 'undefined' ? getCtx(_) : defaultCtx;
    return ctx.bins[binKey];
  };
}

export function createPrivateAccessorFactory(binKey: keyof BinKit): any {
  return (defaultCtx: Ctx, privateBinHost: any) => (_?: Cursor) => {
    const ctx = typeof _ !== 'undefined' ? getCtx(_) : defaultCtx;
    if (ctx === defaultCtx) {
      return privateBinHost[binKey];
    }
    return ctx.bins[binKey];
  };
}
