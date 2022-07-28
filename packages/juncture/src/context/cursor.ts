/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  CursorOf, Juncture, PrivateCursorOf, ValueOf
} from '../juncture';
import { jSymbols } from '../symbols';
import { Ctx } from './ctx';

// #region Symbols
const ctxSymbol = Symbol('ctx');
interface CursorSymbols {
  readonly ctx: typeof ctxSymbol;
}
const cursorSymbols: CursorSymbols = {
  ctx: ctxSymbol
};
// #endregion

export interface Cursor<J extends Juncture = Juncture> {
  readonly [jSymbols.typeParam1]: J; // Preserve type param
  readonly [cursorSymbols.ctx]: Ctx;
}

export function createCursor<J extends Juncture>(ctx: Ctx): Cursor<J> {
  return {
    [cursorSymbols.ctx]: ctx
  } as any;
}

export function getCtx<C extends Cursor>(_: C): Ctx {
  return _[cursorSymbols.ctx];
}

// Used in cursor's tests
export function isCursor(obj: any): obj is Cursor;
export function isCursor(obj: any, ctx: Ctx): obj is Cursor;
export function isCursor(obj: any, ctx?: Ctx) {
  if (!obj) {
    return false;
  }
  if (ctx !== undefined) {
    return obj[cursorSymbols.ctx] === ctx;
  }
  return obj[cursorSymbols.ctx] instanceof Ctx;
}

// ---  Derivations
export type JunctureOfCursor<C extends Cursor> = C extends Cursor<infer J> ? J : never;
export type ValueOfCursor<C extends Cursor> = C extends Cursor<infer J> ? ValueOf<J> : never;
// #endregion

export interface CursorHost<J extends Juncture = Juncture> {
  readonly cursor: CursorOf<J>;
}

export interface PrivateCursorHost<J extends Juncture = Juncture> {
  readonly privateCursor: PrivateCursorOf<J>;
}
