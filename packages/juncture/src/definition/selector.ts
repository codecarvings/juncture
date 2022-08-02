/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PrivateFrameConsumer } from '../context/frames/private-frame';
import {
  createDef, Def, DefKind, isDef
} from './def';

// #region Uni Def
export const notAUniSelectorDef = '\u26A0 ERROR: NOT A SELECTOR';

export enum UniSelectorDefSubKind {
  standard = '',
  param = 'param'
}

export interface UniSelectorDef<T extends UniSelectorDefSubKind, B>
  extends Def<DefKind.selector, T, PrivateFrameConsumer<B>> { }

function createUniSelectorDef<T extends UniSelectorDefSubKind, B>(
  subKind: T,
  selectorFn: PrivateFrameConsumer<B>
): UniSelectorDef<T, B> {
  return createDef(DefKind.selector, subKind, selectorFn);
}

function isUniSelectorDef(obj: any, subKind?: UniSelectorDefSubKind): obj is UniSelectorDef<any, any> {
  return isDef(obj, DefKind.selector, subKind);
}

// ---  Derivations
export type SelectorOfUniSelectorDef<D extends UniSelectorDef<any, any>>
= D extends UniSelectorDef<any, infer B> ? B : never;
// #endregion

// #region Starndard
export interface SelectorDef<B>
  extends UniSelectorDef<UniSelectorDefSubKind.standard, B> { }

export function createSelectorDef
<B>(selectorFn: PrivateFrameConsumer<B>): SelectorDef<B> {
  return createUniSelectorDef(UniSelectorDefSubKind.standard, selectorFn);
}

export function isSelectorDef(obj: any): obj is SelectorDef<any> {
  return isUniSelectorDef(obj, UniSelectorDefSubKind.standard);
}
// #endregion

// #region Param
export interface ParamSelectorDef<B extends (...args: any) => any>
  extends UniSelectorDef<UniSelectorDefSubKind.param, B> { }

export function createParamSelectorDef<B extends (...args: any) => any>(
  selectorFn: PrivateFrameConsumer<B>): ParamSelectorDef<B> {
  return createUniSelectorDef(UniSelectorDefSubKind.param, selectorFn);
}

export function isParamSelectorDef(obj: any): obj is ParamSelectorDef<any> {
  return isUniSelectorDef(obj, UniSelectorDefSubKind.param);
}
// #endregion
