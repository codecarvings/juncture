/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Path } from '../context/path';
import { PrivateFrameConsumer } from '../frame/private-frame';
import {
  createDef, Def, DefKind, isDef
} from './def';

export interface Action {
  readonly target: Path; // TODO | CtxRef;
  readonly key: string;
  readonly args: any;
}

// #region Def
export const notAReducerDef = '\u26A0 ERROR: NOT A REDUCER';

export enum ReducerDefSubKind {
  plain = 'plain',
  mix = 'mix'
}

export interface ReducerDef<T extends ReducerDefSubKind, B extends (...args: any) => any>
  extends Def<DefKind.reducer, T, PrivateFrameConsumer<B>> { }

function createReducerDef<T extends ReducerDefSubKind, B extends (...args: any) => any>(
  subKind: T, reducerFn: PrivateFrameConsumer<B>): ReducerDef<T, B> {
  return createDef(DefKind.reducer, subKind, reducerFn);
}

function isReducerDef(obj: any, subKind?: ReducerDefSubKind): obj is ReducerDef<any, any> {
  return isDef(obj, DefKind.reducer, subKind);
}

// ---  Derivations
export type ReducerOfReducerDef<D extends ReducerDef<any, any>>
  = D extends ReducerDef<any, infer B> ? B : never;

// --- PlainReducer
export interface PlainReducerDef<B extends (...args: any) => any>
  extends ReducerDef<ReducerDefSubKind.plain, B> { }

export function createPlainReducerDef<B extends (...args: any) => any>(
  reducerFn: PrivateFrameConsumer<B>): PlainReducerDef<B> {
  return createReducerDef(ReducerDefSubKind.plain, reducerFn);
}

export function isPlainReducerDef(obj: any): obj is PlainReducerDef<any> {
  return isReducerDef(obj, ReducerDefSubKind.plain);
}
// #endregion

// --- MixReducer
export interface MixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>
  extends ReducerDef<ReducerDefSubKind.mix, B> { }

export function createMixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  reducerFn: PrivateFrameConsumer<B>): MixReducerDef<B> {
  return createReducerDef(ReducerDefSubKind.mix, reducerFn);
}

export function isMixReducerDef(obj: any): obj is MixReducerDef<any> {
  return isReducerDef(obj, ReducerDefSubKind.mix);
}
// #endregion
