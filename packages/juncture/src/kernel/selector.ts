/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PrivateContextRoleConsumer, SelectorContext } from '../context/private-context';
import { Juncture } from '../juncture';
import {
  createIntegratedDefinition, DefinitionKind, IntegratedDefinition, isIntegratedDefinition
} from './definition';

// #region Definition
export const notASelectorDefinition = '!!NOT-A-SELECTOR!!';

export enum SelectorDefinitionSubKind {
  direct = 'direct',
  param = 'param'
}

export interface SelectorDefinition<T extends SelectorDefinitionSubKind, B>
  extends IntegratedDefinition<DefinitionKind.selector, T, PrivateContextRoleConsumer<B>> { }

function createSelectorDefinition<T extends SelectorDefinitionSubKind, B>(
  subKind: T,
  selectorFn: PrivateContextRoleConsumer<B>
): SelectorDefinition<T, B> {
  const result: any = createIntegratedDefinition(DefinitionKind.selector, subKind, selectorFn);
  return result;
}

function isSelectorDefinition(obj: any, subKind?: SelectorDefinitionSubKind): obj is SelectorDefinition<any, any> {
  return isIntegratedDefinition(obj, DefinitionKind.selector, subKind);
}

export type SelectorsOf<O> = {
  readonly [K in keyof O as O[K] extends SelectorDefinition<any, any> ? K : never]: O[K];
};

// --- Direct
export interface DirectSelectorDefinition<B>
  extends SelectorDefinition<SelectorDefinitionSubKind.direct, B> { }

export function createDirectSelectorDefinition
  <B>(selectorFn: PrivateContextRoleConsumer<B>): DirectSelectorDefinition<B> {
  return createSelectorDefinition(SelectorDefinitionSubKind.direct, selectorFn);
}

export function isDirectSelectorDefinition(obj: any): obj is DirectSelectorDefinition<any> {
  return isSelectorDefinition(obj, SelectorDefinitionSubKind.direct);
}

// --- ParamSelector
export interface ParamSelectorDefinition<B extends (...args: any) => any>
  extends SelectorDefinition<SelectorDefinitionSubKind.param, B> { }

export function createParamSelectorDefinition<B extends (...args: any) => any>(
  selectorFn: PrivateContextRoleConsumer<B>): ParamSelectorDefinition<B> {
  return createSelectorDefinition(SelectorDefinitionSubKind.param, selectorFn);
}

export function isParamSelectorDefinition(obj: any): obj is ParamSelectorDefinition<any> {
  return isSelectorDefinition(obj, SelectorDefinitionSubKind.param);
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
