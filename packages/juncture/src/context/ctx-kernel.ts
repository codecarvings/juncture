/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import { defineLazyProperty } from '../util/object';
import { Dispatcher } from './action';
import { Ctx } from './ctx';
import { Cursor } from './cursor';
import { createFrame, Frame } from './frames/frame';
import {
  AccessorKit, equipAccessorKit, equipInternalAccessorKit, InternalAccessorKit
} from './kits/accessor-kit';
import {
  BinKit, equipBinKit, equipInternalBinKit, InternalBinKit
} from './kits/bin-kit';
import { equipInternalFrameKit, InternalFrameKit } from './kits/frame-kit';

export class CtxKernel {
  readonly cursor!: Cursor;

  readonly frame!: Frame;

  readonly bins: BinKit = {} as any;

  readonly accessors: AccessorKit = {} as any;

  readonly internalCursor!: Cursor;

  readonly internalFrames: InternalFrameKit = {} as any;

  readonly internalBins: InternalBinKit = {} as any;

  readonly internalAccessors: InternalAccessorKit = {} as any;

  constructor(ctx: Ctx, dispatcher: Dispatcher) {
    defineLazyProperty(this, 'cursor', () => ctx.juncture[jSymbols.createCursor](ctx));
    defineLazyProperty(this, 'frame', () => createFrame(this, this.accessors));
    equipBinKit(this.bins, ctx, this.internalFrames, dispatcher);
    equipAccessorKit(this.accessors, ctx);

    defineLazyProperty(this, 'internalCursor', () => ctx.juncture[jSymbols.createInternalCursor](ctx));
    equipInternalFrameKit(this.internalFrames, this as any, this.internalAccessors);
    equipInternalBinKit(this.internalBins, ctx, this.internalFrames, dispatcher);
    equipInternalAccessorKit(this.internalAccessors, ctx, this.internalBins);
  }
}
