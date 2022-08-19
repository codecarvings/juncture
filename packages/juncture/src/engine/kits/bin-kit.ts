/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { Dispatcher } from '../action';
import {
  ApplyBin, createApplyBin, createInternalApplyBin, InternalApplyBin
} from '../bins/apply-bin';
import {
  createDispatchBin, createInternalDispatchBin, DispatchBin, InternalDispatchBin
} from '../bins/dispatch-bin';
import {
  createInternalSelectBin, createSelectBin, InternalSelectBin, SelectBin
} from '../bins/select-bin';
import { Gear } from '../gear';
import { InternalFrameKit } from './frame-kit';

// #region BinKit
export interface BinKit<J extends Juncture = Juncture> {
  readonly select: SelectBin<J>;
  readonly apply: ApplyBin<J>;
  readonly dispatch: DispatchBin<J>;
}

export function equipBinKit(bins: any, gear: Gear, frames: InternalFrameKit, dispatcher: Dispatcher) {
  defineLazyProperty(bins, 'select', () => createSelectBin(gear, frames));
  defineLazyProperty(bins, 'apply', () => createApplyBin(gear));
  defineLazyProperty(bins, 'dispatch', () => createDispatchBin(gear, dispatcher));
}
// #endregion

// #region InternalBinKit
export interface InternalBinKit<J extends Juncture = Juncture> {
  readonly select: InternalSelectBin<J>;
  readonly apply: InternalApplyBin<J>;
  readonly dispatch: InternalDispatchBin<J>;
}

export function equipInternalBinKit(internalBins: any, gear: Gear, frames: InternalFrameKit, dispatcher: Dispatcher) {
  defineLazyProperty(internalBins, 'select', () => createInternalSelectBin(gear, frames));
  defineLazyProperty(internalBins, 'apply', () => createInternalApplyBin(gear));
  defineLazyProperty(internalBins, 'dispatch', () => createInternalDispatchBin(gear, dispatcher));
}
// #endregion
