/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { FrameOf, Juncture } from '../juncture';
import { ValueOf } from '../schema-host';
import { Frame, JunctureOfFrame } from './frame';

// --- Symbols
const cursorSymbol = Symbol('frame');
interface CursorSymbols {
  readonly frame: typeof cursorSymbol;
}
const cursorSymbols: CursorSymbols = {
  frame: cursorSymbol
};

export interface Cursor<J extends Juncture = Juncture> {
  readonly [cursorSymbols.frame]: FrameOf<J>;
}

export function createCursor<F extends Frame>(frame: F): Cursor<JunctureOfFrame<F>> {
  return {
    [cursorSymbols.frame]: frame as any
  };
}

export function getFrame<C extends Cursor>(_: C) {
  return _[cursorSymbols.frame];
}

export function isCursor(obj: any): obj is Cursor;
export function isCursor<F extends Frame>(obj: any, frame: F): obj is Cursor<JunctureOfFrame<F>>;
export function isCursor<F extends Frame>(obj: any, frame?: F) {
  if (!obj) {
    return false;
  }
  if (frame !== undefined) {
    return obj[cursorSymbols.frame] === frame;
  }
  return obj[cursorSymbols.frame] instanceof Frame;
}

// ---  Derivations
export type FrameOfCursor<C extends Cursor> = C[CursorSymbols['frame']];
export type JunctureOfCursor<C extends Cursor> = C[CursorSymbols['frame']]['juncture'];
export type ValueOfCursor<C extends Cursor> = ValueOf<C[CursorSymbols['frame']]['juncture']>;
// #endregion
