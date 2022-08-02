/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Action } from '../context/action';
import { PrivateFrameConsumer } from '../context/frames/private-frame';
import {
  createDef, Def, DefKind, isDef
} from './def';

// #region Uni Def
export const notAUniReducerDef = '\u26A0 ERROR: NOT A REDUCER';

export enum UniReducerDefSubKind {
  standard = '',
  mix = 'mix'
}

export interface UniReducerDef<T extends UniReducerDefSubKind, B extends (...args: any) => any>
  extends Def<DefKind.reducer, T, PrivateFrameConsumer<B>> { }

function createUniReducerDef<T extends UniReducerDefSubKind, B extends (...args: any) => any>(
  subKind: T, reducerFn: PrivateFrameConsumer<B>): UniReducerDef<T, B> {
  return createDef(DefKind.reducer, subKind, reducerFn);
}

function isUniReducerDef(obj: any, subKind?: UniReducerDefSubKind): obj is UniReducerDef<any, any> {
  return isDef(obj, DefKind.reducer, subKind);
}

// ---  Derivations
export type ReducerOfUniReducerDef<D extends UniReducerDef<any, any>>
  = D extends UniReducerDef<any, infer B> ? B : never;

// --- Starndard
export interface ReducerDef<B extends (...args: any) => any>
  extends UniReducerDef<UniReducerDefSubKind.standard, B> { }

export function createReducerDef<B extends (...args: any) => any>(
  reducerFn: PrivateFrameConsumer<B>): ReducerDef<B> {
  return createUniReducerDef(UniReducerDefSubKind.standard, reducerFn);
}

export function isReducerDef(obj: any): obj is ReducerDef<any> {
  return isUniReducerDef(obj, UniReducerDefSubKind.standard);
}
// #endregion

// --- Mix
export interface MixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>
  extends UniReducerDef<UniReducerDefSubKind.mix, B> { }

export function createMixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  reducerFn: PrivateFrameConsumer<B>): MixReducerDef<B> {
  return createUniReducerDef(UniReducerDefSubKind.mix, reducerFn);
}

export function isMixReducerDef(obj: any): obj is MixReducerDef<any> {
  return isUniReducerDef(obj, UniReducerDefSubKind.mix);
}
// #endregion
