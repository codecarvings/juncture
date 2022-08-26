/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../driver';
import { OuterSourceBin, SourceBin } from '../../bins/source-bin';
import { Gear } from '../../gear';
import { createAccessorFactory } from '../accessor';
import { Cursor, DriverOfCursor } from '../cursor';

// #region SourceAccessor
export interface SourceAccessor<D extends Driver> {
  (): SourceBin<D>;
  (_: CursorOf<D>): SourceBin<D>;
  <C extends Cursor>(_: C): OuterSourceBin<DriverOfCursor<C>>;
}

// TODO: IMPLEMENT THIS
export const createSourceAccessor: <D extends Driver>(
  defaultGear: Gear,
) => SourceAccessor<D> = createAccessorFactory('source');
// #endregion

// #region OuterSourceAccessor
export interface OuterSourceAccessor<D extends Driver> {
  (): OuterSourceBin<D>;
  <C extends Cursor>(_: C): OuterSourceBin<DriverOfCursor<C>>;
}

// TODO: IMPLEMENT THIS
export const createOuterSourceAccessor
: <D extends Driver>(defaultGear: Gear) => OuterSourceAccessor<D> = undefined!;
// #endregion
