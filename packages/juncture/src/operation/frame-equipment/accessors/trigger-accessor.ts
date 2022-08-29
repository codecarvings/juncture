/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../driver';
import { OuterTriggerBin, TriggerBin } from '../../bins/trigger-bin';
import { Realm } from '../../realm';
import { createAccessorFactory } from '../accessor';
import { Cursor, DriverOfCursor } from '../cursor';

// #region TriggerAccessor
export interface TriggerAccessor<D extends Driver> {
  (): TriggerBin<D>;
  (_: CursorOf<D>): TriggerBin<D>;
  <C extends Cursor>(_: C): OuterTriggerBin<DriverOfCursor<C>>;
}

// TODO: IMPLEMENT THIS
export const createTriggerAccessor: <D extends Driver>(
  defaultRealm: Realm,
) => TriggerAccessor<D> = createAccessorFactory('trigger');
// #endregion

// #region OuterTriggerAccessor
export interface OuterTriggerAccessor<D extends Driver> {
  (): OuterTriggerBin<D>;
  <C extends Cursor>(_: C): OuterTriggerBin<DriverOfCursor<C>>;
}

// TODO: IMPLEMENT THIS
export const createOuterTriggerAccessor
: <D extends Driver>(defaultRealm: Realm) => OuterTriggerAccessor<D> = undefined!;
// #endregion
