/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../driver';
import { ExecBin, ExecBinHost, XpExecBin } from '../../bins/exec-bin';
import { Realm } from '../../realm';
import { getRealm } from '../../realm-host';
import { Cursor, DriverOfCursor } from '../cursor';
import { createPickerFactory, createXpPickerFactory } from '../picker';

// #region UnboundExecPicker
export interface UnboundExecPicker {
  <C extends Cursor>(_: C): XpExecBin<DriverOfCursor<C>>;
}

export function unboundExecPicker<C extends Cursor>(_: C): XpExecBin<DriverOfCursor<C>> {
  return getRealm(_).xpBins.exec;
}
// #endregion

// #region ExecPicker
export interface ExecPicker<D extends Driver> extends UnboundExecPicker {
  (): ExecBin<D>;
  (_: CursorOf<D>): ExecBin<D>;
}

export const createExecPicker: <D extends Driver>(
  defaultRealm: Realm,
  execBinHost: ExecBinHost<D>
) => ExecPicker<D> = createPickerFactory('exec');
// #endregion

// #region XpExecPicker
export interface XpExecPicker<D extends Driver> extends UnboundExecPicker {
  (): XpExecBin<D>;
}

export const createXpExecPicker
: <D extends Driver>(defaultRealm: Realm) => XpExecPicker<D> = createXpPickerFactory('exec');
// #endregion
