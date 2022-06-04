/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PrivateCursorRole } from '../frame/cursor/private-cursor';
import { Juncture, PrivateCursorOf } from '../juncture';
import { jSymbols } from '../symbols';
import { createDefinition, Definition, isDefinition } from './definition';

// #region Selector
interface Selector<Y> {
  (_: PrivateCursorRole): Y;
}
// #endregion

// #region Definition
export const notASelectorDefinition = 'NOT-A-SELECTOR';

type SelectorDefinitionKind = 'selector';
export const selectorDefinitionKind: SelectorDefinitionKind = 'selector';

export interface SelectorDefinition<Y> extends Definition<SelectorDefinitionKind, Selector<Y>> { }
export function createSelectorDefinition<Y>(selectorFn: Selector<Y>): SelectorDefinition<Y> {
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
interface ParamSelectorDefinition<Y extends (...args: any) => any> extends SelectorDefinition<Y> {
  readonly [jSymbols.paramSelectorTag]: true;
}
export function createParamSelectorDefinition<Y extends (...args: any) => any>(
  selectorFn: Selector<Y>): ParamSelectorDefinition<Y> {
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
export function selector<J extends Juncture, Y>(juncture: J, selectorFn: (_: PrivateCursorOf<J>) => Y)
  : SelectorDefinition<Y> {
  return createSelectorDefinition(selectorFn as any);
}

export function paramSelector<J extends Juncture, Y extends (
  ...args: any) => any>(
  juncture: J,
  selectorFn: (_: PrivateCursorOf<J>) => Y
)
  : ParamSelectorDefinition<Y> {
  return createParamSelectorDefinition(selectorFn as any);
}
// #endregion
