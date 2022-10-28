/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../../driver';
import { SelectBin, SelectBinHost, XpSelectBin } from '../../../bins/select-bin';
import { Realm } from '../../../realm';
import { getRealm } from '../../../realm-host';
import { Cursor, DriverOfCursor } from '../../cursor';
import { createPickerFactory, createXpPickerFactory } from '../../picker';

// #region UniSelectPicker
export interface UniSelectPicker {
  <C extends Cursor>(_: C): XpSelectBin<DriverOfCursor<C>>;
}

export function uniSelectPicker<C extends Cursor>(_: C): XpSelectBin<DriverOfCursor<C>> {
  return getRealm(_).xpBins.select;
}
// #endregion

// #region SelectPicker
export interface SelectPicker<D extends Driver> extends UniSelectPicker {
  (): SelectBin<D>;
  (_: CursorOf<D>): SelectBin<D>;
}

export const createSelectPicker : <D extends Driver>(
  defaultRealm: Realm,
  selectBinHost: SelectBinHost<D>
) => SelectPicker<D> = createPickerFactory('select');
// #endregion

// #region XpSelectPicker
export interface XpSelectPicker<D extends Driver> extends UniSelectPicker {
  (): XpSelectBin<D>;
}

export const createXpSelectPicker
: <D extends Driver>(defaultRealm: Realm) => XpSelectPicker<D> = createXpPickerFactory('select');
// #endregion
