/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { Dispatcher } from '../action';
import {
  createDispatchBin, createInternalDispatchBin, DispatchBin, InternalDispatchBin
} from '../bins/dispatch-bin';
import {
  createInternalPrepareBin, createPrepareBin, InternalPrepareBin, PrepareBin
} from '../bins/prepare-bin';
import {
  createInternalReduceBin, createReduceBin, InternalReduceBin, ReduceBin
} from '../bins/reduce-bin';
import {
  createInternalSelectBin, createSelectBin, InternalSelectBin, SelectBin
} from '../bins/select-bin';
import { Ctx } from '../ctx';
import { InternalFrameKit } from './frame-kit';

// #region BinKit
export interface BinKit<J extends Juncture = Juncture> {
  readonly select: SelectBin<J>;
  readonly reduce: ReduceBin<J>;
  readonly prepare: PrepareBin<J>;
  readonly dispatch: DispatchBin<J>;
}

export function equipBinKit(bins: any, ctx: Ctx, frames: InternalFrameKit, dispatcher: Dispatcher) {
  defineLazyProperty(bins, 'select', () => createSelectBin(ctx, frames));
  defineLazyProperty(bins, 'reduce', () => createReduceBin(ctx, frames));
  defineLazyProperty(bins, 'prepare', () => createPrepareBin(ctx));
  defineLazyProperty(bins, 'dispatch', () => createDispatchBin(ctx, dispatcher));
}
// #endregion

// #region InternalBinKit
export interface InternalBinKit<J extends Juncture = Juncture> {
  readonly select: InternalSelectBin<J>;
  readonly reduce: InternalReduceBin<J>;
  readonly prepare: InternalPrepareBin<J>;
  readonly dispatch: InternalDispatchBin<J>;
}

export function equipInternalBinKit(internalBins: any, ctx: Ctx, frames: InternalFrameKit, dispatcher: Dispatcher) {
  defineLazyProperty(internalBins, 'select', () => createInternalSelectBin(ctx, frames));
  defineLazyProperty(internalBins, 'reduce', () => createInternalReduceBin(ctx, frames));
  defineLazyProperty(internalBins, 'prepare', () => createInternalPrepareBin(ctx));
  defineLazyProperty(internalBins, 'dispatch', () => createInternalDispatchBin(ctx, dispatcher));
}
// #endregion
