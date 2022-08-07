/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalFrameConsumer } from '../context/frames/internal-frame';
import { DefAccess, DefType } from './def';
import { createUniDef, isUniDef, UniDef } from './uni-def';

// #region Uni Def
export const notAUniSelectorDef = '\u26A0 ERROR: NOT A SELECTOR';

export enum UniSelectorDefVariety {
  standard = '',
  param = 'param'
}

export type UniSelectorDefAccess = DefAccess.public | DefAccess.private;

export interface UniSelectorDef<V extends UniSelectorDefVariety, A extends UniSelectorDefAccess, B>
  extends UniDef<DefType.selector, V, A, InternalFrameConsumer<B>> { }

function createUniSelectorDef<V extends UniSelectorDefVariety, A extends UniSelectorDefAccess, B>(
  variety: V,
  access: A,
  selectorFn: InternalFrameConsumer<B>
): UniSelectorDef<V, A, B> {
  return createUniDef(DefType.selector, variety, access, selectorFn);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isUniSelectorDef<V extends UniSelectorDefVariety, A extends UniSelectorDefAccess>(
  obj: any,
  variety?: V,
  access?: A
): obj is UniSelectorDef<V, A, any> {
  return isUniDef(obj, DefType.selector, variety, access);
}

// ---  Derivations
export type SelectorOfUniSelectorDef<D extends UniSelectorDef<any, any, any>>
= D extends UniSelectorDef<any, any, infer B> ? B : never;
// #endregion

// #region Starndard
export interface SelectorDef<B>
  extends UniSelectorDef<UniSelectorDefVariety.standard, DefAccess.public, B> { }

export interface PrivateSelectorDef<B>
  extends UniSelectorDef<UniSelectorDefVariety.standard, DefAccess.private, B> { }

export type SameAccessSelectorDef<D extends SelectorDef<any> | PrivateSelectorDef<any>, B> =
  D extends SelectorDef<any> ? SelectorDef<B> : PrivateSelectorDef<B>;

export function createSelectorDef
  <B>(access: DefAccess.public, selectorFn: InternalFrameConsumer<B>): SelectorDef<B>;
export function createSelectorDef
  <B>(access: DefAccess.private, selectorFn: InternalFrameConsumer<B>): PrivateSelectorDef<B>;
export function createSelectorDef<B>(access: UniSelectorDefAccess, selectorFn: InternalFrameConsumer<B>) {
  return createUniSelectorDef(UniSelectorDefVariety.standard, access, selectorFn);
}

export function isSelectorDef(obj: any): obj is (SelectorDef<any> | PrivateSelectorDef<any>);
export function isSelectorDef(obj: any, access: DefAccess.public): obj is SelectorDef<any>;
export function isSelectorDef(obj: any, access: DefAccess.private): obj is PrivateSelectorDef<any>;
export function isSelectorDef(obj: any, access?: UniSelectorDefAccess) {
  return isUniSelectorDef(obj, UniSelectorDefVariety.standard, access);
}
// #endregion

// #region Param
export interface ParamSelectorDef<B extends (...args: any) => any>
  extends UniSelectorDef<UniSelectorDefVariety.param, DefAccess.public, B> { }

export interface PrivateParamSelectorDef<B extends (...args: any) => any>
  extends UniSelectorDef<UniSelectorDefVariety.param, DefAccess.private, B> { }

export function createParamSelectorDef<B extends (...args: any) => any>(
  access: DefAccess.public, selectorFn: InternalFrameConsumer<B>): ParamSelectorDef<B>;
export function createParamSelectorDef<B extends (...args: any) => any>(
  access: DefAccess.private, selectorFn: InternalFrameConsumer<B>): PrivateParamSelectorDef<B>;
export function createParamSelectorDef<B extends (...args: any) => any>(
  access: UniSelectorDefAccess, selectorFn: InternalFrameConsumer<B>) {
  return createUniSelectorDef(UniSelectorDefVariety.param, access, selectorFn);
}

export function isParamSelectorDef(obj: any): obj is (ParamSelectorDef<any> | PrivateParamSelectorDef<any>);
export function isParamSelectorDef(obj: any, access: DefAccess.public): obj is ParamSelectorDef<any>;
export function isParamSelectorDef(obj: any, access: DefAccess.private): obj is PrivateParamSelectorDef<any>;
export function isParamSelectorDef(obj: any, access?: UniSelectorDefAccess) {
  return isUniSelectorDef(obj, UniSelectorDefVariety.param, access);
}
// #endregion
