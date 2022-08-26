/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../driver';
import { DispatchBin, DispatchBinHost, OuterDispatchBin } from '../../bins/dispatch-bin';
import { Gear } from '../../gear';
import { createAccessorFactory, createOuterAccessorFactory } from '../accessor';
import { Cursor, DriverOfCursor } from '../cursor';

// #region DispatchAccessor
export interface DispatchAccessor<D extends Driver> {
  (): DispatchBin<D>;
  (_: CursorOf<D>): DispatchBin<D>;
  <C extends Cursor>(_: C): OuterDispatchBin<DriverOfCursor<C>>;
}

export const createDispatchAccessor: <D extends Driver>(
  defaultGear: Gear,
  dispatchBinHost: DispatchBinHost<D>
) => DispatchAccessor<D> = createAccessorFactory('dispatch');
// #endregion

// #region OuterDispatchAccessor
export interface OuterDispatchAccessor<D extends Driver> {
  (): OuterDispatchBin<D>;
  <C extends Cursor>(_: C): OuterDispatchBin<DriverOfCursor<C>>;
}

export const createOuterDispatchAccessor
: <D extends Driver>(defaultGear: Gear) => OuterDispatchAccessor<D> = createOuterAccessorFactory('dispatch');
// #endregion
