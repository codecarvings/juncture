/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PrivateContextRole, ReactorContext } from '../context/private-context';
import { HandledValueOf, Juncture } from '../juncture';
import { createDefinition, Definition, isDefinition } from './definition';

// #region Reactor
interface Reducer<B extends (...args: any) => any> {
  ($: PrivateContextRole): B;
}
// #endregion

// #region Definition
export const notAReactorDefinition = 'NOT-A-REACTOR';

type ReactorDefinitionKind = 'reactor';
export const reactorDefinitionKind: ReactorDefinitionKind = 'reactor';

export interface ReactorDefinition<B extends (...args: any) => any>
  extends Definition<ReactorDefinitionKind, Reducer<B>> { }
export function createReactorDefinition<B extends (...args: any) => any>(
  reactorFn: Reducer<B>): ReactorDefinition<B> {
  const result: any = createDefinition(reactorDefinitionKind, reactorFn);
  return result;
}

export function isReactorDefinition(obj: any): obj is ReactorDefinition<any> {
  return isDefinition(obj, reactorDefinitionKind);
}

export type ReactorsOf<O> = {
  readonly [K in keyof O as O[K] extends ReactorDefinition<any> ? K : never]: O[K];
};

// #region Composer
export function reducer<J extends Juncture, B extends (
  ...args: any) => HandledValueOf<J>>(
  juncture: J,
  reducerFn: ($: ReactorContext<J>) => B
)
  : ReactorDefinition<B> {
  return createReactorDefinition(reducerFn as any);
}
// #endregion
