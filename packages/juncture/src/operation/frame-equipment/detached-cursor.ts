/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { junctureSymbols } from '../../juncture-symbols';
import { isObject } from '../../utilities/object';
import { PathFragment } from '../path';
import { Realm } from '../realm';
import { Cursor } from './cursor';

export type DetachedCursorParent = Realm | DetachedCursor;

// A detached cursor is a cursor not attached to a mounted Realm.
// For example it's created by the List Junctuture: _.myList.item(999)
// It can be used:
// - By the UniCheckInstrument to check if a realm Exists
// - By any instrument, in this case:
//    - If the target Realm is inaccessible: An error is thrown
//    - If the garget Realm is accessible: A console working is displayed to inform of a possible problem
//      (performance issue)
export interface DetachedCursor extends Cursor {
  readonly [junctureSymbols.realm]: any; // realm not available
  readonly [junctureSymbols.parent]: DetachedCursorParent;
  readonly [junctureSymbols.key]: PathFragment;
}

export function createDetachedCursor(
  driver: Driver,
  parent: Realm | DetachedCursor,
  key: PathFragment
): DetachedCursor {
  return {
    [junctureSymbols.cursor]: true,
    [junctureSymbols.driver]: driver,
    [junctureSymbols.parent]: parent,
    [junctureSymbols.key]: key
  } as any;
}

export function isDetachedCursor(obj: any): obj is DetachedCursor {
  if (!isObject(obj)) {
    return false;
  }
  if (!obj[junctureSymbols.cursor] === true) {
    return false;
  }
  if (!obj[junctureSymbols.parent]) {
    return false;
  }
  return true;
}
