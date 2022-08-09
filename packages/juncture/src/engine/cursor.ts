/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  CursorOf, InternalCursorOf, Juncture
} from '../juncture';
import { JSymbols, jSymbols } from '../symbols';
import { Gear } from './gear';
import { addGearLink, GearHost } from './gear-host';

export interface Cursor<J extends Juncture = Juncture> extends GearHost {
  readonly [jSymbols.juncture]: J; // Preserve type param
}

export function createCursor<J extends Juncture>(gear: Gear): Cursor<J> {
  return addGearLink({}, gear);
}

// ---  Derivations
export type JunctureOfCursor<C extends Cursor> = C[JSymbols['juncture']];
// #endregion

export interface CursorHost<J extends Juncture = Juncture> {
  readonly cursor: CursorOf<J>;
}

export interface InternalCursorHost<J extends Juncture = Juncture> {
  readonly internalCursor: InternalCursorOf<J>;
}
