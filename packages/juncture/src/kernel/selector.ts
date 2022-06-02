/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, PrivateCursorOf } from '../juncture';
import { jSymbols } from '../symbols';
import { createDefinition, Definition } from './definition';

// #region Selector
interface Selector<J extends Juncture = Juncture, Y = unknown> {
  (_: PrivateCursorOf<J>): (...args: any) => Y;
}
interface DirectSelector<J extends Juncture = Juncture, Y = unknown> {
  (_: PrivateCursorOf<J>): () => Y;
}
interface ParamSelector<J extends Juncture = Juncture, Y = unknown> {
  (_: PrivateCursorOf<J>): (...args: any) => Y;
}

// Removes the type of the cursor
export type ComposedSelector<S extends Selector> = (_: any) => ReturnType<S>;
// #endregion

// #region Definition
type SelectorDefinitionKind = 'selector';
export const selectorDefinitionKind: SelectorDefinitionKind = 'selector';
export enum SelectorDefinitionSubkind {
  direct = 'direct',
  param = 'param'
}
interface SelectorDefinition<S extends Selector, Q extends SelectorDefinitionSubkind>
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

interface DirectSelectorDefinition<S extends DirectSelector>
  extends SelectorDefinition<S, SelectorDefinitionSubkind.direct> { }
// eslint-disable-next-line @typescript-eslint/no-shadow
export function createDirectSelectorDefinition<S extends DirectSelector>(selector: S): DirectSelectorDefinition<S> {
  const result: any = createSelectorDefinition(selector, SelectorDefinitionSubkind.direct);
  return result;
}

interface ParamSelectorDefinition<S extends ParamSelector>
  extends SelectorDefinition<S, SelectorDefinitionSubkind.param> { }
// eslint-disable-next-line @typescript-eslint/no-shadow
export function createParamSelectorDefinition<S extends DirectSelector>(selector: S): ParamSelectorDefinition<S> {
  const result: any = createSelectorDefinition(selector, SelectorDefinitionSubkind.param);
  return result;
}
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
