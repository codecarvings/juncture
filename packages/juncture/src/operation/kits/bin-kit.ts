/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import { Dispatcher } from '../action';
import {
  ApplyBin, createApplyBin, createXpApplyBin, XpApplyBin
} from '../bins/apply-bin';
import {
  createDispatchBin, createXpDispatchBin, DispatchBin, XpDispatchBin
} from '../bins/dispatch-bin';
import { createEmitBin, EmitBin } from '../bins/emit-bin';
import {
  createExecBin, createXpExecBin, ExecBin, XpExecBin
} from '../bins/exec-bin';
import {
  createActiveQuerySelectBin,
  createSelectBin, createXpSelectBin, SelectBin, XpSelectBin
} from '../bins/select-bin';
import { ActiveQueryMonitorFn } from '../frames/active-query-frame';
import { Realm } from '../realm';
import { FrameKit } from './frame-kit';

// #region BinKit
export interface BinKit<D extends Driver = Driver> {
  readonly select: SelectBin<D>;
  readonly apply: ApplyBin<D>;
  readonly dispatch: DispatchBin<D>;
  readonly emit: EmitBin<D>;
  readonly exec: ExecBin<D>;
}

export function prepareBinKit(bins: any, realm: Realm, frames: FrameKit, dispatcher: Dispatcher) {
  defineLazyProperty(bins, 'select', () => createSelectBin(realm, frames));
  defineLazyProperty(bins, 'apply', () => createApplyBin(realm));
  defineLazyProperty(bins, 'dispatch', () => createDispatchBin(realm, dispatcher));
  defineLazyProperty(bins, 'emit', () => createEmitBin(realm, frames));
  defineLazyProperty(bins, 'exec', () => createExecBin(realm));
}
// #endregion

// #region XpBinKit
export interface XpBinKit<D extends Driver = Driver> {
  readonly select: XpSelectBin<D>;
  readonly apply: XpApplyBin<D>;
  readonly dispatch: XpDispatchBin<D>;
  readonly exec: XpExecBin<D>;

  createActiveQuerySelectBin(monitorFn: ActiveQueryMonitorFn): XpSelectBin<D>;
}

export function prepareXpBinKit(bins: any, realm: Realm, frames: FrameKit, dispatcher: Dispatcher) {
  defineLazyProperty(bins, 'select', () => createXpSelectBin(realm, frames));
  defineLazyProperty(bins, 'apply', () => createXpApplyBin(realm));
  defineLazyProperty(bins, 'dispatch', () => createXpDispatchBin(realm, dispatcher));
  defineLazyProperty(bins, 'exec', () => createXpExecBin(realm));

  // eslint-disable-next-line no-param-reassign
  bins.createActiveQuerySelectBin = (
    monitorFn: ActiveQueryMonitorFn
  ) => createActiveQuerySelectBin(realm, frames, monitorFn);
}
// #endregion
