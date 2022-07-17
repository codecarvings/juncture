/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PrivateContextRoleConsumer } from '../context/private-context';
import {
  createDef, Def, DefKind, isDef
} from './def';

// #region Def
export const notASelectorDef = '!!NOT-A-SELECTOR!!';

export enum SelectorDefSubKind {
  direct = 'direct',
  param = 'param'
}

export interface SelectorDef<T extends SelectorDefSubKind, B>
  extends Def<DefKind.selector, T, PrivateContextRoleConsumer<B>> { }

function createSelectorDef<T extends SelectorDefSubKind, B>(
  subKind: T,
  selectorFn: PrivateContextRoleConsumer<B>
): SelectorDef<T, B> {
  return createDef(DefKind.selector, subKind, selectorFn);
}

function isSelectorDef(obj: any, subKind?: SelectorDefSubKind): obj is SelectorDef<any, any> {
  return isDef(obj, DefKind.selector, subKind);
}

// ---  Derivations
export type SelectorDefsOf<O> = {
  readonly [K in keyof O as O[K] extends SelectorDef<any, any> ? K : never]: O[K];
};

export type SelectorOfSelectorDef<D extends SelectorDef<any, any>>
  = D extends SelectorDef<any, infer B> ? B : never;

// --- Direct
export interface DirectSelectorDef<B>
  extends SelectorDef<SelectorDefSubKind.direct, B> { }

export function createDirectSelectorDef
  <B>(selectorFn: PrivateContextRoleConsumer<B>): DirectSelectorDef<B> {
  return createSelectorDef(SelectorDefSubKind.direct, selectorFn);
}

export function isDirectSelectorDef(obj: any): obj is DirectSelectorDef<any> {
  return isSelectorDef(obj, SelectorDefSubKind.direct);
}

// --- ParamSelector
export interface ParamSelectorDef<B extends (...args: any) => any>
  extends SelectorDef<SelectorDefSubKind.param, B> { }

export function createParamSelectorDef<B extends (...args: any) => any>(
  selectorFn: PrivateContextRoleConsumer<B>): ParamSelectorDef<B> {
  return createSelectorDef(SelectorDefSubKind.param, selectorFn);
}

export function isParamSelectorDef(obj: any): obj is ParamSelectorDef<any> {
  return isSelectorDef(obj, SelectorDefSubKind.param);
}
// #endregion
