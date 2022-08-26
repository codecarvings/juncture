/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  CursorOf, Driver, OuterCursorOf, ValueOf
} from '../../driver';
import { JSymbols, jSymbols } from '../../symbols';
import { Gear } from '../gear';
import { addGearLink, GearHost } from '../gear-host';

export interface Cursor<D extends Driver = Driver> extends GearHost {
  readonly [jSymbols.driver]: D; // Preserve type param
}

export function createCursor<D extends Driver>(gear: Gear): Cursor<D> {
  return addGearLink({}, gear);
}

// ---  Derivations
export type DriverOfCursor<C extends Cursor> = C[JSymbols['driver']];
export type ValueOfCursor<C extends Cursor> = ValueOf<C[JSymbols['driver']]>;
// #endregion

export interface CursorHost<D extends Driver = Driver> {
  readonly cursor: CursorOf<D>;
}

export interface OuterCursorHost<D extends Driver = Driver> {
  readonly outerCursor: OuterCursorOf<D>;
}
