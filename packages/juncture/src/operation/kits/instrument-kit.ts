/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import { DetectInstrument } from '../frame-equipment/instruments/detect-instrument';
import {
  ApplyPicker, createApplyPicker, createXpApplyPicker, XpApplyPicker
} from '../frame-equipment/instruments/pickers/apply-picker';
import {
  createDispatchPicker, createXpDispatchPicker, DispatchPicker, XpDispatchPicker
} from '../frame-equipment/instruments/pickers/dispatch-picker';
import { EmitPicker } from '../frame-equipment/instruments/pickers/emit-picker';
import {
  createExecPicker, createXpExecPicker, ExecPicker, XpExecPicker
} from '../frame-equipment/instruments/pickers/exec-picker';
import {
  createSelectPicker, createXpSelectPicker, SelectPicker, XpSelectPicker
} from '../frame-equipment/instruments/pickers/select-picker';
import { createSetInstrument, SetInstrument } from '../frame-equipment/instruments/set-instrument';
import { createValueInstrument, ValueInstrument } from '../frame-equipment/instruments/value-instrument';
import { Realm } from '../realm';
import { BinKit } from './bin-kit';

// #region InstrumentKit
export interface InstrumentKit<D extends Driver = Driver> {
  readonly value: ValueInstrument<D>;
  readonly set: SetInstrument<D>;
  readonly detect: DetectInstrument<D>;

  readonly select: SelectPicker<D>;
  readonly apply: ApplyPicker<D>;
  readonly dispatch: DispatchPicker<D>;
  readonly emit: EmitPicker<D>;
  readonly exec: ExecPicker<D>;
}

export function prepareInstrumentKit(instruments: any, realm: Realm, bins: BinKit) {
  defineLazyProperty(instruments, 'value', () => createValueInstrument(realm));
  defineLazyProperty(instruments, 'set', () => createSetInstrument(realm));

  defineLazyProperty(instruments, 'select', () => createSelectPicker(realm, bins));
  defineLazyProperty(instruments, 'apply', () => createApplyPicker(realm, bins));
  defineLazyProperty(instruments, 'dispatch', () => createDispatchPicker(realm, bins));
  defineLazyProperty(instruments, 'emit', () => createDispatchPicker(realm, bins));
  defineLazyProperty(instruments, 'exec', () => createExecPicker(realm, bins));
}
// #endregion

// #region XpInstrumentKit
export interface XpInstrumentKit<D extends Driver = Driver> {
  readonly value: ValueInstrument<D>;
  readonly set: SetInstrument<D>;
  readonly detect: DetectInstrument<D>;

  readonly select: XpSelectPicker<D>;
  readonly apply: XpApplyPicker<D>;
  readonly dispatch: XpDispatchPicker<D>;
  readonly exec: XpExecPicker<D>;
}

export function prepareXpInstrumentKit(instruments: any, realm: Realm) {
  defineLazyProperty(instruments, 'value', () => createValueInstrument(realm));
  defineLazyProperty(instruments, 'set', () => createSetInstrument(realm));

  defineLazyProperty(instruments, 'select', () => createXpSelectPicker(realm));
  defineLazyProperty(instruments, 'apply', () => createXpApplyPicker(realm));
  defineLazyProperty(instruments, 'dispatch', () => createXpDispatchPicker(realm));
  defineLazyProperty(instruments, 'exec', () => createXpExecPicker(realm));
}
// #endregion
