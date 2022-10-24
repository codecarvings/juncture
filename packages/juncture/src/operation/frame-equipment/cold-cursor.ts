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

export interface ColdCursor extends Cursor {
  readonly [junctureSymbols.path]: Path;
}

export function createColdCursor(driver: Driver, path: Path): ColdCursor {
  return {
    [junctureSymbols.cursorDriver]: driver,
    [junctureSymbols.realm]: undefined!,
    [junctureSymbols.path]: path
  };
}

export function isColdCursor(obj: any): obj is ColdCursor {
  if (!isObject(obj)) {
    return false;
  }
  if (!isDriver((obj as any)[junctureSymbols.cursorDriver])) {
    return false;
  }
  return Array.isArray((obj as any)[junctureSymbols.path]);
}
