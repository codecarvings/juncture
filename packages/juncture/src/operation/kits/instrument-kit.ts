/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import { createUniCheckInstrument, UniCheckInstrument } from '../frame-equipment/instruments/check-instrument';
import { DetectInstrument, UniDetectInstrument } from '../frame-equipment/instruments/detect-instrument';
import { createGetInstrument, GetInstrument, UniGetInstrument } from '../frame-equipment/instruments/get-instrument';
import {
  ApplyPicker, createApplyPicker
} from '../frame-equipment/instruments/pickers/apply-picker';
import {
  createDispatchPicker, DispatchPicker, UniDispatchPicker
} from '../frame-equipment/instruments/pickers/dispatch-picker';
import { EmitPicker } from '../frame-equipment/instruments/pickers/emit-picker';
import {
  createExecPicker, ExecPicker, UniExecPicker
} from '../frame-equipment/instruments/pickers/exec-picker';
import {
  createSelectPicker, SelectPicker, UniSelectPicker
} from '../frame-equipment/instruments/pickers/select-picker';
import { createSetInstrument, SetInstrument } from '../frame-equipment/instruments/set-instrument';
import { Realm } from '../realm';
import { BinKit } from './bin-kit';

// #region UniInstrumentKit
export interface UniInstrumentKit {
  readonly check: UniCheckInstrument;
  readonly get: UniGetInstrument;
  readonly detect: UniDetectInstrument;

  readonly select: UniSelectPicker;
  readonly dispatch: UniDispatchPicker;
  readonly exec: UniExecPicker;
}

export function prepareUniInstrumentKit(instruments: any) {
  defineLazyProperty(instruments, 'check', () => createUniCheckInstrument());
  defineLazyProperty(instruments, 'get', () => createUniCheckInstrument());
  defineLazyProperty(instruments, 'detect', () => createUniCheckInstrument());

  defineLazyProperty(instruments, 'select', () => createUniCheckInstrument());
  defineLazyProperty(instruments, 'dispatch', () => createUniCheckInstrument());
  defineLazyProperty(instruments, 'exec', () => createUniCheckInstrument());
}
// #endregion

// #region InstrumentKit
export interface InstrumentKit<D extends Driver = Driver> {
  readonly get: GetInstrument<D>;
  readonly set: SetInstrument<D>;
  readonly detect: DetectInstrument<D>;

  readonly select: SelectPicker<D>;
  readonly apply: ApplyPicker<D>;
  readonly dispatch: DispatchPicker<D>;
  readonly emit: EmitPicker<D>;
  readonly exec: ExecPicker<D>;
}

export function prepareInstrumentKit(instruments: any, realm: Realm, bins: BinKit) {
  defineLazyProperty(instruments, 'get', () => createGetInstrument(realm));
  defineLazyProperty(instruments, 'set', () => createSetInstrument(realm));

  defineLazyProperty(instruments, 'select', () => createSelectPicker(realm, bins));
  defineLazyProperty(instruments, 'apply', () => createApplyPicker(realm, bins));
  defineLazyProperty(instruments, 'dispatch', () => createDispatchPicker(realm, bins));
  defineLazyProperty(instruments, 'emit', () => createDispatchPicker(realm, bins));
  defineLazyProperty(instruments, 'exec', () => createExecPicker(realm, bins));
}
// #endregion
