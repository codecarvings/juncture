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
  createDispatchBin, createPrivateDispatchBin, DispatchBin, PrivateDispatchBin
} from '../bins/dispatch-bin';
import {
  createPrepareBin, createPrivatePrepareBin, PrepareBin, PrivatePrepareBin
} from '../bins/prepare-bin';
import {
  createPrivateReduceBin, createReduceBin, PrivateReduceBin, ReduceBin
} from '../bins/reduce-bin';
import {
  createPrivateSelectBin, createSelectBin, PrivateSelectBin, SelectBin
} from '../bins/select-bin';
import { Ctx } from '../ctx';
import { PrivateFrameKit } from './frame-kit';

// #region BinKit
export interface BinKit<J extends Juncture = Juncture> {
  readonly select: SelectBin<J>;
  readonly reduce: ReduceBin<J>;
  readonly prepare: PrepareBin<J>;
  readonly dispatch: DispatchBin<J>;
}

export function prepareBinKit(bins: any, ctx: Ctx, frames: PrivateFrameKit, dispatch: Dispatcher) {
  defineLazyProperty(bins, 'select', () => createSelectBin(ctx, frames));
  defineLazyProperty(bins, 'reduce', () => createReduceBin(ctx, frames));
  defineLazyProperty(bins, 'prepare', () => createPrepareBin(ctx));
  defineLazyProperty(bins, 'dispatch', () => createDispatchBin(ctx, dispatch));
}
// #endregion

// #region PrivateBinKit
export interface PrivateBinKit<J extends Juncture = Juncture> {
  readonly select: PrivateSelectBin<J>;
  readonly reduce: PrivateReduceBin<J>;
  readonly prepare: PrivatePrepareBin<J>;
  readonly dispatch: PrivateDispatchBin<J>;
}

export function preparePrivateBinKit(privateBins: any, ctx: Ctx, frames: PrivateFrameKit, dispatch: Dispatcher) {
  defineLazyProperty(privateBins, 'select', () => createPrivateSelectBin(ctx, frames));
  defineLazyProperty(privateBins, 'reduce', () => createPrivateReduceBin(ctx, frames));
  defineLazyProperty(privateBins, 'prepare', () => createPrivatePrepareBin(ctx));
  defineLazyProperty(privateBins, 'dispatch', () => createPrivateDispatchBin(ctx, dispatch));
}
// #endregion
