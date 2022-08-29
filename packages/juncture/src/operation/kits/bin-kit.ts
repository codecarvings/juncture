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
  createEmitBin, createOuterEmitBin, EmitBin, OuterEmitBin
} from '../bins/emit-bin';
import {
  createOuterSelectBin, createSelectBin, OuterSelectBin, SelectBin
} from '../bins/select-bin';
import { createOuterTriggerBin, OuterTriggerBin, TriggerBin } from '../bins/trigger-bin';
import { Realm } from '../realm';
import { FrameKit } from './frame-kit';

// #region BinKit
export interface BinKit<D extends Driver = Driver> {
  readonly select: SelectBin<D>;
  readonly apply: ApplyBin<D>;
  readonly dispatch: DispatchBin<D>;
  readonly emit: EmitBin<D>;
  readonly trigger: TriggerBin<D>;
}

export function prepareBinKit(bins: any, realm: Realm, frames: FrameKit, dispatcher: Dispatcher) {
  defineLazyProperty(bins, 'select', () => createSelectBin(realm, frames));
  defineLazyProperty(bins, 'apply', () => createApplyBin(realm));
  defineLazyProperty(bins, 'dispatch', () => createDispatchBin(realm, dispatcher));
  defineLazyProperty(bins, 'emit', () => createEmitBin(realm, frames));
  defineLazyProperty(bins, 'trigger', () => createOuterTriggerBin(realm));
}
// #endregion

// #region OuterBinKit
export interface OuterBinKit<D extends Driver = Driver> {
  readonly select: OuterSelectBin<D>;
  readonly apply: OuterApplyBin<D>;
  readonly dispatch: OuterDispatchBin<D>;
  readonly emit: OuterEmitBin<D>;
  readonly trigger: OuterTriggerBin<D>;
}

export function prepareOuterBinKit(bins: any, realm: Realm, frames: FrameKit, dispatcher: Dispatcher) {
  defineLazyProperty(bins, 'select', () => createOuterSelectBin(realm, frames));
  defineLazyProperty(bins, 'apply', () => createOuterApplyBin(realm));
  defineLazyProperty(bins, 'dispatch', () => createOuterDispatchBin(realm, dispatcher));
  defineLazyProperty(bins, 'emit', () => createOuterEmitBin(realm, frames));
  defineLazyProperty(bins, 'trigger', () => createOuterTriggerBin(realm));
}
// #endregion
