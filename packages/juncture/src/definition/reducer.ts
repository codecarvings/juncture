/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Action } from '../context/action';
import { InternalFrameConsumer } from '../context/frames/internal-frame';
import { DefAccess, DefType } from './def';
import { createUniDef, isUniDef, UniDef } from './uni-def';

// #region Uni Def
export const notAUniReducerDef = '\u26A0 ERROR: NOT A REDUCER';

export enum UniReducerDefVariety {
  standard = '',
  mix = 'mix'
}

export interface UniReducerDef<V extends UniReducerDefVariety, A extends DefAccess, B extends (...args: any) => any>
  extends UniDef<DefType.reducer, V, A, InternalFrameConsumer<B>> { }

function createUniReducerDef<V extends UniReducerDefVariety, A extends DefAccess, B extends (...args: any) => any>(
  variety: V, access: A, reducerFn: InternalFrameConsumer<B>): UniReducerDef<V, A, B> {
  return createUniDef(DefType.reducer, variety, access, reducerFn);
}

function isUniReducerDef<V extends UniReducerDefVariety, A extends DefAccess>(
  obj: any,
  variety?: UniReducerDefVariety,
  access?: DefAccess
): obj is UniReducerDef<V, A, any> {
  return isUniDef(obj, DefType.reducer, variety, access);
}

// ---  Derivations
export type ReducerOfUniReducerDef<D extends UniReducerDef<any, any, any>>
  = D extends UniReducerDef<any, any, infer B> ? B : never;

// --- Starndard
export interface ReducerDef<B extends (...args: any) => any>
  extends UniReducerDef<UniReducerDefVariety.standard, DefAccess.public, B> { }

export interface ProtectedReducerDef<B extends (...args: any) => any>
  extends UniReducerDef<UniReducerDefVariety.standard, DefAccess.protected, B> { }

export interface PrivateReducerDef<B extends (...args: any) => any>
  extends UniReducerDef<UniReducerDefVariety.standard, DefAccess.private, B> { }

export function createReducerDef<B extends (...args: any) => any>(
  access: DefAccess.public, reducerFn: InternalFrameConsumer<B>): ReducerDef<B>;
export function createReducerDef<B extends (...args: any) => any>(
  access: DefAccess.protected, reducerFn: InternalFrameConsumer<B>): ProtectedReducerDef<B>;
export function createReducerDef<B extends (...args: any) => any>(
  access: DefAccess.private, reducerFn: InternalFrameConsumer<B>): PrivateReducerDef<B>;
export function createReducerDef<B extends (...args: any) => any>(
  access: DefAccess, reducerFn: InternalFrameConsumer<B>) {
  return createUniReducerDef(UniReducerDefVariety.standard, access, reducerFn);
}

export function isReducerDef(obj: any): obj is (ReducerDef<any> | ProtectedReducerDef<any> | PrivateReducerDef<any>);
export function isReducerDef(obj: any, access: DefAccess.public): obj is ReducerDef<any>;
export function isReducerDef(obj: any, access: DefAccess.protected): obj is ProtectedReducerDef<any>;
export function isReducerDef(obj: any, access: DefAccess.private): obj is PrivateReducerDef<any>;
export function isReducerDef(obj: any, access?: DefAccess) {
  return isUniReducerDef(obj, UniReducerDefVariety.standard, access);
}
// #endregion

// --- Mix
export interface MixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>
  extends UniReducerDef<UniReducerDefVariety.mix, DefAccess.public, B> { }

export interface ProtectedMixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>
  extends UniReducerDef<UniReducerDefVariety.mix, DefAccess.protected, B> { }

export interface PrivateMixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>
  extends UniReducerDef<UniReducerDefVariety.mix, DefAccess.private, B> { }

export function createMixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  access: DefAccess.public, reducerFn: InternalFrameConsumer<B>): MixReducerDef<B>;
export function createMixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  access: DefAccess.protected, reducerFn: InternalFrameConsumer<B>): ProtectedMixReducerDef<B>;
export function createMixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  access: DefAccess.private, reducerFn: InternalFrameConsumer<B>): PrivateMixReducerDef<B>;
export function createMixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  access: DefAccess, reducerFn: InternalFrameConsumer<B>) {
  return createUniReducerDef(UniReducerDefVariety.mix, access, reducerFn);
}

// eslint-disable-next-line max-len
export function isMixReducerDef(obj: any): obj is (MixReducerDef<any> | ProtectedMixReducerDef<any> | PrivateMixReducerDef<any>);
export function isMixReducerDef(obj: any, access: DefAccess.public): obj is MixReducerDef<any>;
export function isMixReducerDef(obj: any, access: DefAccess.protected): obj is ProtectedMixReducerDef<any>;
export function isMixReducerDef(obj: any, access: DefAccess.private): obj is PrivateMixReducerDef<any>;
export function isMixReducerDef(obj: any, access?: DefAccess) {
  return isUniReducerDef(obj, UniReducerDefVariety.mix, access);
}
// #endregion
