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
import { ConcreteCtx, Ctx } from './ctx';

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
  readonly juncture: J;
  readonly [cursorSymbols.ctx]: Ctx;
}

export function createCursor<C extends Ctx>(ctx: C): Cursor {
  return {
    juncture: undefined!,
    [cursorSymbols.ctx]: ctx as any
  };
}

export function getCtx<C extends Cursor>(_: C) {
  return _[cursorSymbols.ctx];
}

export function isCursor(obj: any): obj is Cursor;
export function isCursor<C extends Ctx>(obj: any, ctx: C): obj is Cursor;
export function isCursor<C extends Ctx>(obj: any, ctx?: C) {
  if (!obj) {
    return false;
  }
  if (ctx !== undefined) {
    return obj[cursorSymbols.ctx] === ctx;
  }
  return obj[cursorSymbols.ctx] instanceof ConcreteCtx;
}

// ---  Derivations
export type JunctureOfCursor<C extends Cursor> = C['juncture'];
export type ValueOfCursor<C extends Cursor> = ValueOf<C['juncture']>;
// #endregion

export interface CursorHost<J extends Juncture = Juncture> {
  readonly cursor: CursorOf<J>;
}

export interface PrivateCursorHost<J extends Juncture = Juncture> {
  readonly privateCursor: PrivateCursorOf<J>;
}
