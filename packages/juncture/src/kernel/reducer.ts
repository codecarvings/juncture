/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MixReducerContext, PrivateContextRole, ReducerContext } from '../context/private-context';
import { Path } from '../frame/path';
import { HandledValueOf, Juncture } from '../juncture';
import { jSymbols } from '../symbols';
import { createDefinition, Definition, isDefinition } from './definition';

// #region Reducer
interface Reducer<B extends (...args: any) => any> {
  ($: PrivateContextRole): B;
}

interface MixReducer<B extends (...args: any) => ReadonlyArray<Action>> {
  ($: PrivateContextRole): B;
}

export interface Action {
  readonly target: Path; // TODO | FrameRef;
  readonly key: string;
  readonly args: any;
}
// #endregion

// #region Definition
export const notAReducerDefinition = '!!NOT-A-REDUCER!!';

type ReducerDefinitionKind = 'reducer';
export const reducerDefinitionKind: ReducerDefinitionKind = 'reducer';

export interface ReducerDefinition<B extends (...args: any) => any>
  extends Definition<ReducerDefinitionKind, Reducer<B>> { }

export function createReducerDefinition<B extends (...args: any) => any>(
  reducerFn: Reducer<B>): ReducerDefinition<B> {
  const result: any = createDefinition(reducerDefinitionKind, reducerFn);
  return result;
}

export function isReducerDefinition(obj: any): obj is ReducerDefinition<any> {
  return isDefinition(obj, reducerDefinitionKind);
}

export type ReducersOf<O> = {
  readonly [K in keyof O as O[K] extends ReducerDefinition<any> ? K : never]: O[K];
};

// --- MixReducer
interface MixReducerDefinition<B extends (...args: any) => ReadonlyArray<Action>> extends ReducerDefinition<B> {
  readonly [jSymbols.mixReducerTag]: true;
}
export function createMixRedicerDefinition<B extends (...args: any) => ReadonlyArray<Action>>(
  reducerFn: MixReducer<B>): MixReducerDefinition<B> {
  const result: any = createReducerDefinition(reducerFn);
  result[jSymbols.mixReducerTag] = true;
  return result;
}

export function isMixReducerDefinition(obj: any): obj is MixReducerDefinition<any> {
  if (!isReducerDefinition(obj)) {
    return false;
  }
  return !!(obj as any)[jSymbols.mixReducerTag];
}

export function isPlainReducerDefinition(obj: any): obj is ReducerDefinition<any> {
  if (!isReducerDefinition) {
    return false;
  }
  return !isMixReducerDefinition(obj);
}
// #endregion

// #region Composer
export function reducer<J extends Juncture, B extends (
  ...args: any) => HandledValueOf<J>>(
  juncture: J,
  reducerFn: ($: ReducerContext<J>) => B
)
  : ReducerDefinition<B> {
  return createReducerDefinition(reducerFn as any);
}

export function mixReducer<J extends Juncture, B extends (
  ...args: any) => ReadonlyArray<Action>>(
  juncture: J,
  reducerFn: ($: MixReducerContext<J>) => B
)
  : MixReducerDefinition<B> {
  return createMixRedicerDefinition(reducerFn as any);
}
// #endregion
