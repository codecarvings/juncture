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
import { createDef, Def, DefKind, isDef } from './def';

export interface Action {
  readonly target: Path; // TODO | FrameRef;
  readonly key: string;
  readonly args: any;
}

// #region Def
export const notAReducerDef = '!!NOT-A-REDUCER!!';

export enum ReducerDefSubKind {
  plain = 'plain',
  mix = 'mix'
}

export interface ReducerDef<T extends ReducerDefSubKind, B extends (...args: any) => any>
  extends Def<DefKind.reducer, T, PrivateContextRoleConsumer<B>> { }

function createReducerDef<T extends ReducerDefSubKind, B extends (...args: any) => any>(
  subKind: T, reducerFn: PrivateContextRoleConsumer<B>): ReducerDef<T, B> {
  const result: any = createDef(DefKind.reducer, subKind, reducerFn);
  return result;
}

function isReducerDef(obj: any, subKind?: ReducerDefSubKind): obj is ReducerDef<any, any> {
  return isDef(obj, DefKind.reducer, subKind);
}

export type ReducerDefsOf<O> = {
  readonly [K in keyof O as O[K] extends ReducerDef<any, any> ? K : never]: O[K];
};

// --- PlainReducer
interface PlainReducerDef<B extends (...args: any) => any>
  extends ReducerDef<ReducerDefSubKind.plain, B> { }

export function createPlainReducerDef<B extends (...args: any) => any>(
  reducerFn: PrivateContextRoleConsumer<B>): PlainReducerDef<B> {
  return createReducerDef(ReducerDefSubKind.plain, reducerFn);
}

export function isPlainReducerDef(obj: any): obj is PlainReducerDef<any> {
  return isReducerDef(obj, ReducerDefSubKind.plain);
}
// #endregion

// --- MixReducer
interface MixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>
  extends ReducerDef<ReducerDefSubKind.mix, B> { }

export function createMixReducerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  reducerFn: PrivateContextRoleConsumer<B>): MixReducerDef<B> {
  return createReducerDef(ReducerDefSubKind.mix, reducerFn);
}

export function isMixReducerDef(obj: any): obj is MixReducerDef<any> {
  return isReducerDef(obj, ReducerDefSubKind.mix);
}
// #endregion

// #region Composer
export function reducer<J extends Juncture, B extends (
  ...args: any) => HandledValueOf<J>>(
  juncture: J,
  reducerFn: ($: ReducerContext<J>) => B
)
  : PlainReducerDef<B> {
  return createPlainReducerDef(reducerFn as any);
}

export function mixReducer<J extends Juncture, B extends (
  ...args: any) => ReadonlyArray<Action>>(
  juncture: J,
  reducerFn: ($: MixReducerContext<J>) => B
)
  : MixReducerDef<B> {
  return createMixReducerDef(reducerFn as any);
}
// #endregion
