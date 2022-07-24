/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CtxOf, Juncture, ValueOf } from '../juncture';
import { Ctx, JunctureOfCtx } from './ctx';

// --- Symbols
const ctxSymbol = Symbol('ctx');
interface CursorSymbols {
  readonly ctx: typeof ctxSymbol;
}
const cursorSymbols: CursorSymbols = {
  ctx: ctxSymbol
};

export interface Cursor<J extends Juncture = Juncture> {
  readonly [cursorSymbols.ctx]: CtxOf<J>;
}

export function createCursor<C extends Ctx>(ctx: C): Cursor<JunctureOfCtx<C>> {
  return {
    [cursorSymbols.ctx]: ctx as any
  };
}

export function getCtx<C extends Cursor>(_: C) {
  return _[cursorSymbols.ctx];
}

export function isCursor(obj: any): obj is Cursor;
export function isCursor<C extends Ctx>(obj: any, ctx: C): obj is Cursor<JunctureOfCtx<C>>;
export function isCursor<C extends Ctx>(obj: any, ctx?: C) {
  if (!obj) {
    return false;
  }
  if (ctx !== undefined) {
    return obj[cursorSymbols.ctx] === ctx;
  }
  return obj[cursorSymbols.ctx] instanceof Ctx;
}

// ---  Derivations
export type CtxOfCursor<C extends Cursor> = C[CursorSymbols['ctx']];
export type JunctureOfCursor<C extends Cursor> = C[CursorSymbols['ctx']]['juncture'];
export type ValueOfCursor<C extends Cursor> = ValueOf<C[CursorSymbols['ctx']]['juncture']>;
// #endregion
