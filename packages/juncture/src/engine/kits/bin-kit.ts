/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { defineLazyProperty } from '../../tool/object';
import { Dispatcher } from '../action';
import {
  ApplyBin, createApplyBin, createOuterApplyBin, OuterApplyBin
} from '../bins/apply-bin';
import {
  createDispatchBin, createOuterDispatchBin, DispatchBin, OuterDispatchBin
} from '../bins/dispatch-bin';
import {
  createOuterSelectBin, createSelectBin, OuterSelectBin, SelectBin
} from '../bins/select-bin';
import { createOuterSourceBin, OuterSourceBin, SourceBin } from '../bins/source-bin';
import { Gear } from '../gear';
import { FrameKit } from './frame-kit';

// #region BinKit
export interface BinKit<D extends Driver = Driver> {
  readonly select: SelectBin<D>;
  readonly apply: ApplyBin<D>;
  readonly dispatch: DispatchBin<D>;
  readonly source: SourceBin<D>;
}

export function prepareBinKit(bins: any, gear: Gear, frames: FrameKit, dispatcher: Dispatcher) {
  defineLazyProperty(bins, 'select', () => createSelectBin(gear, frames));
  defineLazyProperty(bins, 'apply', () => createApplyBin(gear));
  defineLazyProperty(bins, 'dispatch', () => createDispatchBin(gear, dispatcher));
  defineLazyProperty(bins, 'source', () => createOuterSourceBin(gear));
}
// #endregion

// #region OuterBinKit
export interface OuterBinKit<D extends Driver = Driver> {
  readonly select: OuterSelectBin<D>;
  readonly apply: OuterApplyBin<D>;
  readonly dispatch: OuterDispatchBin<D>;
  readonly source: OuterSourceBin<D>;
}

export function prepareOuterBinKit(bins: any, gear: Gear, frames: FrameKit, dispatcher: Dispatcher) {
  defineLazyProperty(bins, 'select', () => createOuterSelectBin(gear, frames));
  defineLazyProperty(bins, 'apply', () => createOuterApplyBin(gear));
  defineLazyProperty(bins, 'dispatch', () => createOuterDispatchBin(gear, dispatcher));
  defineLazyProperty(bins, 'source', () => createOuterSourceBin(gear));
}
// #endregion
