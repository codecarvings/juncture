/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PrivateContextRole, SelectorContext } from '../context/private-context';
import { Juncture } from '../juncture';
import { jSymbols } from '../symbols';
import { createDefinition, Definition, isDefinition } from './definition';

// #region Selector
interface Selector<B> {
  ($: PrivateContextRole): B;
}
// #endregion

// #region Definition
export const notASelectorDefinition = 'NOT-A-SELECTOR';

type SelectorDefinitionKind = 'selector';
export const selectorDefinitionKind: SelectorDefinitionKind = 'selector';

export interface SelectorDefinition<B> extends Definition<SelectorDefinitionKind, Selector<B>> { }
export function createSelectorDefinition<B>(selectorFn: Selector<B>): SelectorDefinition<B> {
  const result: any = createDefinition(selectorDefinitionKind, selectorFn);
  return result;
}

export function isSelectorDefinition(obj: any): obj is SelectorDefinition<any> {
  return isDefinition(obj, selectorDefinitionKind);
}

export type SelectorsOf<O> = {
  readonly [K in keyof O as O[K] extends SelectorDefinition<any> ? K : never]: O[K];
};

// --- ParamSelector
interface ParamSelectorDefinition<B extends (...args: any) => any> extends SelectorDefinition<B> {
  readonly [jSymbols.paramSelectorTag]: true;
}
export function createParamSelectorDefinition<B extends (...args: any) => any>(
  selectorFn: Selector<B>): ParamSelectorDefinition<B> {
  const result: any = createSelectorDefinition(selectorFn);
  result[jSymbols.paramSelectorTag] = true;
  return result;
}

export function isParamSelectorDefinition(obj: any): obj is ParamSelectorDefinition<any> {
  if (!isSelectorDefinition(obj)) {
    return false;
  }
  return !!(obj as any)[jSymbols.paramSelectorTag];
}

export function isDirectSelectorDefinition(obj: any): obj is SelectorDefinition<any> {
  if (!isSelectorDefinition) {
    return false;
  }
  return !isParamSelectorDefinition(obj);
}
// #endregion

// #region Composer
export function selector<J extends Juncture, B>(juncture: J, selectorFn: ($: SelectorContext<J>) => B)
  : SelectorDefinition<B> {
  return createSelectorDefinition(selectorFn as any);
}

export function paramSelector<J extends Juncture, B extends (
  ...args: any) => any>(
  juncture: J,
  selectorFn: ($: SelectorContext<J>) => B
)
  : ParamSelectorDefinition<B> {
  return createParamSelectorDefinition(selectorFn as any);
}
// #endregion
