/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Frame } from './frame';

// --- Symbols
const cursorSymbol = Symbol('frame');
interface CursorSymbols {
  readonly frame: typeof cursorSymbol;
}
const cursorSymbols: CursorSymbols = {
  frame: cursorSymbol
};

export interface Cursor<F extends Frame<any>> {
  readonly [cursorSymbols.frame]: F;
}

export function getFrame<C extends Cursor<any>>(_: C) {
  return _[cursorSymbols.frame];
}

// ---  Derivations
export type FrameOfCursor<C extends Cursor<any>> = C[CursorSymbols['frame']];
export type JunctureOfCursor<C extends Cursor<any>> = C[CursorSymbols['frame']]['juncture'];
// #endregion
