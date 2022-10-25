/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver, isDriver } from '../../driver';
import { junctureSymbols } from '../../juncture-symbols';
import { isObject } from '../../utilities/object';
import { Path } from '../path';
import { Cursor } from './cursor';

// A cold cursor is a cursor not suitable to be used with instruments
// but that can be used to check if a Realm is mounted.
// eg: if (isMounted(_.myList.item(999))) ...
export interface ColdCursor extends Cursor {
  readonly [junctureSymbols.realm]: any; // realm contains a Path
}

export function createColdCursor(driver: Driver, path: Path): ColdCursor {
  return {
    [junctureSymbols.cursor]: true,
    [junctureSymbols.driver]: driver,
    [junctureSymbols.realm]: path
  };
}

export function isColdCursor(obj: any): obj is ColdCursor {
  if (!isObject(obj)) {
    return false;
  }
  if (!(obj as any)[junctureSymbols.cursor] === true) {
    return false;
  }
  if (!isDriver((obj as any)[junctureSymbols.driver])) {
    return false;
  }
  return Array.isArray((obj as any)[junctureSymbols.realm]);
}
