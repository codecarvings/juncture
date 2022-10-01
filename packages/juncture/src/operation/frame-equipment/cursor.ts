/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  CursorOf, Driver, ValueOf
} from '../../driver';
import { junctureSymbols, JunctureSymbols } from '../../juncture-symbols';
import { Realm } from '../realm';
import { addRealmLink, RealmHost } from '../realm-host';

export interface Cursor<D extends Driver = Driver> extends RealmHost {
  readonly [junctureSymbols.driver]: D; // Preserve type param
}

export function createCursor<D extends Driver>(realm: Realm): Cursor<D> {
  return addRealmLink({}, realm);
}

// ---  Derivations
export type DriverOfCursor<C extends Cursor> = C[JunctureSymbols['driver']];
export type ValueOfCursor<C extends Cursor> = ValueOf<C[JunctureSymbols['driver']]>;
// #endregion

export interface CursorHost<D extends Driver = Driver> {
  readonly cursor: CursorOf<D>;
}

export interface CursorMap {
  readonly [key: string]: Cursor;
}
