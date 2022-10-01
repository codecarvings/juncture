/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import {
  ApplyPicker, createApplyPicker, createXpApplyPicker, XpApplyPicker
} from '../frame-equipment/pickers/apply-picker';
import {
  createDispatchPicker, createXpDispatchPicker, DispatchPicker, XpDispatchPicker
} from '../frame-equipment/pickers/dispatch-picker';
import { EmitPicker } from '../frame-equipment/pickers/emit-picker';
import {
  createExecPicker, createXpExecPicker, ExecPicker, XpExecPicker
} from '../frame-equipment/pickers/exec-picker';
import { createSelectPicker, createXpSelectPicker, SelectPicker, XpSelectPicker } from '../frame-equipment/pickers/select-picker';
import { Realm } from '../realm';
import { BinKit } from './bin-kit';

// #region PickerKit
export interface PickerKit<D extends Driver = Driver> {
  readonly select: SelectPicker<D>;
  readonly apply: ApplyPicker<D>;
  readonly dispatch: DispatchPicker<D>;
  readonly emit: EmitPicker<D>;
  readonly exec: ExecPicker<D>;
}

export function preparePickerKit(pickers: any, realm: Realm, bins: BinKit) {
  defineLazyProperty(pickers, 'select', () => createSelectPicker(realm, bins));
  defineLazyProperty(pickers, 'apply', () => createApplyPicker(realm, bins));
  defineLazyProperty(pickers, 'dispatch', () => createDispatchPicker(realm, bins));
  defineLazyProperty(pickers, 'emit', () => createDispatchPicker(realm, bins));
  defineLazyProperty(pickers, 'exec', () => createExecPicker(realm, bins));
}
// #endregion

// #region XpPickerKit
export interface XpPickerKit<D extends Driver = Driver> {
  readonly select: XpSelectPicker<D>;
  readonly apply: XpApplyPicker<D>;
  readonly dispatch: XpDispatchPicker<D>;
  readonly exec: XpExecPicker<D>;
}

export function prepareXpPickerKit(pickers: any, realm: Realm) {
  defineLazyProperty(pickers, 'select', () => createXpSelectPicker(realm));
  defineLazyProperty(pickers, 'apply', () => createXpApplyPicker(realm));
  defineLazyProperty(pickers, 'dispatch', () => createXpDispatchPicker(realm));
  defineLazyProperty(pickers, 'exec', () => createXpExecPicker(realm));
}
// #endregion
