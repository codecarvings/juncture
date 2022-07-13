/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ValueOf } from '../juncture';
import { Frame } from './frame';

// --- Symbols
const cursorSymbol = Symbol('frame');
interface CursorSymbols {
  readonly frame: typeof cursorSymbol;
}
const cursorSymbols: CursorSymbols = {
  frame: cursorSymbol
};

export interface Cursor<F extends Frame<any> = Frame<any>> {
  readonly [cursorSymbols.frame]: F;
}

export function createCursor<F extends Frame<any>>(frame: F): Cursor<F> {
  return {
    [cursorSymbols.frame]: frame
  };
}

export function getFrame<C extends Cursor>(_: C) {
  return _[cursorSymbols.frame];
}

export function isCursor<F extends Frame<any>>(obj: any, frame?: F): obj is F {
  if (!obj) {
    return false;
  }
  if (frame !== undefined) {
    return obj[cursorSymbols.frame] === frame;
  }
  return obj[cursorSymbols.frame] instanceof Frame<any>;
}

// ---  Derivations
export type FrameOfCursor<C extends Cursor> = C[CursorSymbols['frame']];
export type JunctureOfCursor<C extends Cursor> = C[CursorSymbols['frame']]['juncture'];
export type ValueOfCursor<C extends Cursor> = ValueOf<C[CursorSymbols['frame']]['juncture']>;
// #endregion
