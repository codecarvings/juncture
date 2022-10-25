/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../../driver';
import { ApplyBin, ApplyBinHost, XpApplyBin } from '../../../bins/apply-bin';
import { Realm } from '../../../realm';
import { Cursor, DriverOfCursor } from '../../cursor';
import { createPickerFactory, createXpPickerFactory } from '../../picker';

// #region ApplyPicker
export interface ApplyPicker<D extends Driver> {
  (): ApplyBin<D>;
  (_: CursorOf<D>): ApplyBin<D>;
  <C extends Cursor>(_: C): XpApplyBin<DriverOfCursor<C>>;
}

export const createApplyPicker: <D extends Driver>(
  defaultRealm: Realm,
  applyBinHost: ApplyBinHost<D>
) => ApplyPicker<D> = createPickerFactory('apply');
// #endregion

// #region XpApplyPicker
export interface XpApplyPicker<D extends Driver> {
  (): XpApplyBin<D>;
  <C extends Cursor>(_: C): XpApplyBin<DriverOfCursor<C>>;
}

export const createXpApplyPicker
: <D extends Driver>(defaultRealm: Realm) => XpApplyPicker<D> = createXpPickerFactory('apply');
// #endregion
