/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../../driver';
import { DispatchBin, DispatchBinHost, XpDispatchBin } from '../../../bins/dispatch-bin';
import { Realm } from '../../../realm';
import { getRealm } from '../../../realm-host';
import { Cursor, DriverOfCursor } from '../../cursor';
import { createPickerFactory, createXpPickerFactory } from '../../picker';

// #region UniDispatchPicker
export interface UniDispatchPicker {
  <C extends Cursor>(_: C): XpDispatchBin<DriverOfCursor<C>>;
}

export function uniDispatchPicker<C extends Cursor>(_: C): XpDispatchBin<DriverOfCursor<C>> {
  return getRealm(_).xpBins.dispatch;
}
// #endregion

// #region DispatchPicker
export interface DispatchPicker<D extends Driver> extends UniDispatchPicker {
  (): DispatchBin<D>;
  (_: CursorOf<D>): DispatchBin<D>;
}

export const createDispatchPicker: <D extends Driver>(
  defaultRealm: Realm,
  dispatchBinHost: DispatchBinHost<D>
) => DispatchPicker<D> = createPickerFactory('dispatch');
// #endregion

// #region XpDispatchPicker
export interface XpDispatchPicker<D extends Driver> extends UniDispatchPicker {
  (): XpDispatchBin<D>;
}

export const createXpDispatchPicker
: <D extends Driver>(defaultRealm: Realm) => XpDispatchPicker<D> = createXpPickerFactory('dispatch');
// #endregion
