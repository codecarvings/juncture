/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../driver';
import { ApplyBin, ApplyBinHost, OuterApplyBin } from '../../bins/apply-bin';
import { Gear } from '../../gear';
import { createAccessorFactory, createOuterAccessorFactory } from '../accessor';
import { Cursor, DriverOfCursor } from '../cursor';

// #region ApplyAccessor
export interface ApplyAccessor<D extends Driver> {
  (): ApplyBin<D>;
  (_: CursorOf<D>): ApplyBin<D>;
  <C extends Cursor>(_: C): OuterApplyBin<DriverOfCursor<C>>;
}

export const createApplyAccessor: <D extends Driver>(
  defaultGear: Gear,
  applyBinHost: ApplyBinHost<D>
) => ApplyAccessor<D> = createAccessorFactory('apply');
// #endregion

// #region OuterApplyAccessor
export interface OuterApplyAccessor<D extends Driver> {
  (): OuterApplyBin<D>;
  <C extends Cursor>(_: C): OuterApplyBin<DriverOfCursor<C>>;
}

export const createOuterApplyAccessor
: <D extends Driver>(defaultGear: Gear) => OuterApplyAccessor<D> = createOuterAccessorFactory('apply');
// #endregion
