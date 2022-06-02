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
import {
  createDefinition, Definition, DefinitionTag, isDefinition
} from './definition';

// #region Selector
interface Selector<J extends Juncture = any, Y = any> {
  (_: PrivateCursorOf<J>): (...args: any) => Y;
}
interface DirectSelector<J extends Juncture = any, Y = any> {
  (_: PrivateCursorOf<J>): () => Y;
}
interface ParamSelector<J extends Juncture = any, Y = any> {
  (_: PrivateCursorOf<J>): (...args: any) => Y;
}

// Removes the type of the cursor
export type ComposedSelector<S extends Selector> = (_: PrivateCursorRole) => ReturnType<S>;
// #endregion

// #region Definition
export const notASelectorDefinition = 'NOT-A-SELECTOR';

type SelectorDefinitionKind = 'selector';
export type SelectorDefinitionTag = DefinitionTag<SelectorDefinitionKind>;

export const selectorDefinitionKind: SelectorDefinitionKind = 'selector';
export enum SelectorDefinitionSubkind {
  direct = 'direct',
  param = 'param'
}
export interface SelectorDefinition<S extends Selector, Q extends SelectorDefinitionSubkind>
  extends Definition<SelectorDefinitionKind, S> {
  readonly [jSymbols.selectorDefinitionSubkind]: Q;
}

function createSelectorDefinition<S extends Selector, K extends SelectorDefinitionSubkind>(
  // eslint-disable-next-line @typescript-eslint/no-shadow
  selector: S,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subkind: K
): SelectorDefinition<S, K> {
  const result: any = createDefinition(selectorDefinitionKind, selector);
  result[jSymbols.selectorDefinitionSubkind] = subkind;
  return result;
}

function isSelectorDefinition(obj: any): obj is SelectorDefinition<any, any> {
  return isDefinition(obj, selectorDefinitionKind);
}

export interface DirectSelectorDefinition<S extends DirectSelector>
  extends SelectorDefinition<S, SelectorDefinitionSubkind.direct> { }
// eslint-disable-next-line @typescript-eslint/no-shadow
export function createDirectSelectorDefinition<S extends DirectSelector>(selector: S): DirectSelectorDefinition<S> {
  const result: any = createSelectorDefinition(selector, SelectorDefinitionSubkind.direct);
  return result;
}

export function isDirectSelectorDefinition(obj: any): obj is DirectSelectorDefinition<any> {
  if (!isSelectorDefinition(obj)) {
    return false;
  }
  return obj[jSymbols.selectorDefinitionSubkind] === SelectorDefinitionSubkind.direct;
}

export interface ParamSelectorDefinition<S extends ParamSelector>
  extends SelectorDefinition<S, SelectorDefinitionSubkind.param> { }
// eslint-disable-next-line @typescript-eslint/no-shadow
export function createParamSelectorDefinition<S extends DirectSelector>(selector: S): ParamSelectorDefinition<S> {
  const result: any = createSelectorDefinition(selector, SelectorDefinitionSubkind.param);
  return result;
}

export function isParamSelectorDefinition(obj: any): obj is ParamSelectorDefinition<any> {
  if (!isSelectorDefinition(obj)) {
    return false;
  }
  return obj[jSymbols.selectorDefinitionSubkind] === SelectorDefinitionSubkind.param;
}

// export type SelectorDefinitionsOf<O extends object> = {
//   readonly [K in keyof O as K extends string ? K : never]:
//   O[K] extends SelectorDefinition<any, any> ? O[K] : never;
// };
// #endregion

// #region Composer
export function selector<J extends Juncture, S extends DirectSelector<J>>(juncture: J, fn: S)
  : DirectSelectorDefinition<ComposedSelector<S>> {
  return createDirectSelectorDefinition(fn) as any;
}

export function paramSelector<J extends Juncture, S extends ParamSelector<J>>(juncture: J, fn: S)
  : ParamSelectorDefinition<ComposedSelector<S>> {
  return createParamSelectorDefinition(fn) as any;
}
// #endregion
