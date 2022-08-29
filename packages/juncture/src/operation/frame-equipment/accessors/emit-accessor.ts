/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../driver';
import { EmitBin, EmitBinHost, OuterEmitBin } from '../../bins/emit-bin';
import { Realm } from '../../realm';
import { createAccessorFactory, createOuterAccessorFactory } from '../accessor';
import { Cursor, DriverOfCursor } from '../cursor';

// #region EmitAccessor
export interface EmitAccessor<D extends Driver> {
  (): EmitBin<D>;
  (_: CursorOf<D>): EmitBin<D>;
  <C extends Cursor>(_: C): OuterEmitBin<DriverOfCursor<C>>;
}

export const createEmitAccessor: <D extends Driver>(
  defaultRealm: Realm,
  emitBinHost: EmitBinHost<D>
) => EmitAccessor<D> = createAccessorFactory('emit');
// #endregion

// #region OuterEmitAccessor
export interface OuterEmitAccessor<D extends Driver> {
  (): OuterEmitBin<D>;
  <C extends Cursor>(_: C): OuterEmitBin<DriverOfCursor<C>>;
}

export const createOuterEmitAccessor
: <D extends Driver>(defaultRealm: Realm) => OuterEmitBin<D> = createOuterAccessorFactory('emit');
// #endregion
