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
export const notASelectorDefinition = '!!NOT-A-SELECTOR!!';

type SelectorDefinitionKind = 'selector';
export const selectorDefinitionKind: SelectorDefinitionKind = 'selector';

export enum SelectorMode {
  direct = 'direct',
  param = 'param'
}
interface SelectorDefinitionOtions {
  readonly mode: SelectorMode;
}

interface SelectorDefinition<B, O extends SelectorDefinitionOtions>
  extends Definition<SelectorDefinitionKind, Selector<B>, O> { }

function createSelectorDefinition
  <B, O extends SelectorDefinitionOtions>(selectorFn: Selector<B>, options: O): SelectorDefinition<B, O> {
  const result: any = createDefinition(selectorDefinitionKind, selectorFn, options);
  return result;
}

function isSelectorDefinition(obj: any): obj is SelectorDefinition<any, any> {
  return isDefinition(obj, selectorDefinitionKind);
}

export type SelectorsOf<O> = {
  readonly [K in keyof O as O[K] extends SelectorDefinition<any, any> ? K : never]: O[K];
};

// --- Direct
interface DirectSelectorDefinition<B, O extends { mode: SelectorMode.direct }>
  extends SelectorDefinition<B, O> { }

export function createDirectSelectorDefinition
  <B, O extends { mode: SelectorMode.direct }>(selectorFn: Selector<B>, options?: O): DirectSelectorDefinition<B, O> {
  return createSelectorDefinition(selectorFn, options ?? { mode: SelectorMode.direct } as O);
}

export function isDirectSelectorDefinition(obj: any): obj is DirectSelectorDefinition<any, any> {
  if (!isSelectorDefinition) {
    return false;
  }
  const options = (obj as any)[jSymbols.definitionOptions];
  return options ? options.mode === SelectorMode.direct : false;
}

// --- ParamSelector
interface ParamSelectorDefinition<B extends (...args: any) => any>
  extends SelectorDefinition<B, { mode: SelectorMode.param }> { }

export function createParamSelectorDefinition<B extends (...args: any) => any>(
  selectorFn: Selector<B>): ParamSelectorDefinition<B> {
  return createSelectorDefinition(selectorFn, { mode: SelectorMode.param });
}

export function isParamSelectorDefinition(obj: any): obj is ParamSelectorDefinition<any> {
  if (!isSelectorDefinition(obj)) {
    return false;
  }
  const options = (obj as any)[jSymbols.definitionOptions];
  return options ? options.mode === SelectorMode.param : false;
}
// #endregion

// #region Composer
export function selector<J extends Juncture, B>(juncture: J, selectorFn: ($: SelectorContext<J>) => B)
  : DirectSelectorDefinition<B> {
  return createDirectSelectorDefinition(selectorFn as any);
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
