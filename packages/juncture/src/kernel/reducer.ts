/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MixReducerContext, PrivateContextRoleConsumer, ReducerContext } from '../context/private-context';
import { Path } from '../frame/path';
import { HandledValueOf, Juncture } from '../juncture';
import {
  createIntegratedDefinition, DefinitionKind, IntegratedDefinition, isIntegratedDefinition
} from './definition';

export interface Action {
  readonly target: Path; // TODO | FrameRef;
  readonly key: string;
  readonly args: any;
}

// #region Definition
export const notAReducerDefinition = '!!NOT-A-REDUCER!!';

export enum ReducerDefinitionSubKind {
  plain = 'plain',
  mix = 'mix'
}

export interface ReducerDefinition<T extends ReducerDefinitionSubKind, B extends (...args: any) => any>
  extends IntegratedDefinition<DefinitionKind.reducer, T, PrivateContextRoleConsumer<B>> { }

export function createReducerDefinition<T extends ReducerDefinitionSubKind, B extends (...args: any) => any>(
  subKind: T, reducerFn: PrivateContextRoleConsumer<B>): ReducerDefinition<T, B> {
  const result: any = createIntegratedDefinition(DefinitionKind.reducer, subKind, reducerFn);
  return result;
}

export function isReducerDefinition(obj: any, subKind?: ReducerDefinitionSubKind): obj is ReducerDefinition<any, any> {
  return isIntegratedDefinition(obj, DefinitionKind.reducer, subKind);
}

export type ReducersOf<O> = {
  readonly [K in keyof O as O[K] extends ReducerDefinition<any, any> ? K : never]: O[K];
};

// --- PlainReducer
interface PlainReducerDefinition<B extends (...args: any) => any>
  extends ReducerDefinition<ReducerDefinitionSubKind.plain, B> { }

export function createPlainReducerDefinition<B extends (...args: any) => any>(
  reducerFn: PrivateContextRoleConsumer<B>): PlainReducerDefinition<B> {
  return createReducerDefinition(ReducerDefinitionSubKind.plain, reducerFn);
}

export function isPlainReducerDefinition(obj: any): obj is PlainReducerDefinition<any> {
  return isReducerDefinition(obj, ReducerDefinitionSubKind.plain);
}
// #endregion

// --- MixReducer
interface MixReducerDefinition<B extends (...args: any) => ReadonlyArray<Action>>
  extends ReducerDefinition<ReducerDefinitionSubKind.mix, B> { }

export function createMixReducerDefinition<B extends (...args: any) => ReadonlyArray<Action>>(
  reducerFn: PrivateContextRoleConsumer<B>): MixReducerDefinition<B> {
  return createReducerDefinition(ReducerDefinitionSubKind.mix, reducerFn);
}

export function isMixReducerDefinition(obj: any): obj is MixReducerDefinition<any> {
  return isReducerDefinition(obj, ReducerDefinitionSubKind.mix);
}
// #endregion

// #region Composer
export function reducer<J extends Juncture, B extends (
  ...args: any) => HandledValueOf<J>>(
  juncture: J,
  reducerFn: ($: ReducerContext<J>) => B
)
  : PlainReducerDefinition<B> {
  return createPlainReducerDefinition(reducerFn as any);
}

export function mixReducer<J extends Juncture, B extends (
  ...args: any) => ReadonlyArray<Action>>(
  juncture: J,
  reducerFn: ($: MixReducerContext<J>) => B
)
  : MixReducerDefinition<B> {
  return createMixReducerDefinition(reducerFn as any);
}
// #endregion
