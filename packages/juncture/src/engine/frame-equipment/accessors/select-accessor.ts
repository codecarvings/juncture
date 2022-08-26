/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../driver';
import { OuterSelectBin, SelectBin, SelectBinHost } from '../../bins/select-bin';
import { Gear } from '../../gear';
import { createAccessorFactory, createOuterAccessorFactory } from '../accessor';
import { Cursor, DriverOfCursor } from '../cursor';

// #region SelectAccessor
export interface SelectAccessor<D extends Driver> {
  (): SelectBin<D>;
  (_: CursorOf<D>): SelectBin<D>;
  <C extends Cursor>(_: C): OuterSelectBin<DriverOfCursor<C>>;
}

export const createSelectAccessor : <D extends Driver>(
  defaultGear: Gear,
  selectBinHost: SelectBinHost<D>
) => SelectAccessor<D> = createAccessorFactory('select');
// #endregion

// #region OuterSelectAccessor
export interface OuterSelectAccessor<D extends Driver> {
  (): OuterSelectBin<D>;
  <C extends Cursor>(_: C): OuterSelectBin<DriverOfCursor<C>>;
}

export const createOuterSelectAccessor
: <D extends Driver>(defaultGear: Gear) => OuterSelectAccessor<D> = createOuterAccessorFactory('select');
// #endregion
