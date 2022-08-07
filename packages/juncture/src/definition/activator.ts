/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Action } from '../context/action';
import { InternalFrameConsumer } from '../context/frames/internal-frame';
import { DefAccess, DefType } from './def';
import { createMixedDef, isMixedDef, MixedDef } from './mixed-def';

// #region Uni Def
export const notAnActivatorDef = '\u26A0 ERROR: NOT AN ACTIVATOR';

export enum ActivatorDefVariety {
  reducer = 'reducer',
  trigger = 'trigger'
}

export interface ActivatorDef<V extends ActivatorDefVariety, A extends DefAccess, B extends (...args: any) => any>
  extends MixedDef<DefType.reducer, V, A, InternalFrameConsumer<B>> { }

function createActivatorDef<V extends ActivatorDefVariety, A extends DefAccess, B extends (...args: any) => any>(
  variety: V, access: A, reducerFn: InternalFrameConsumer<B>): ActivatorDef<V, A, B> {
  return createMixedDef(DefType.reducer, variety, access, reducerFn);
}

function isActivatorDef<V extends ActivatorDefVariety, A extends DefAccess>(
  obj: any,
  variety?: ActivatorDefVariety,
  access?: DefAccess
): obj is ActivatorDef<V, A, any> {
  return isMixedDef(obj, DefType.reducer, variety, access);
}

// ---  Derivations
export type ActivatorOfActivatorDef<D extends ActivatorDef<any, any, any>>
  = D extends ActivatorDef<any, any, infer B> ? B : never;

// --- Reducer
export interface ReducerDef<B extends (...args: any) => any>
  extends ActivatorDef<ActivatorDefVariety.reducer, DefAccess.public, B> { }

export interface ProtectedReducerDef<B extends (...args: any) => any>
  extends ActivatorDef<ActivatorDefVariety.reducer, DefAccess.protected, B> { }

export interface PrivateReducerDef<B extends (...args: any) => any>
  extends ActivatorDef<ActivatorDefVariety.reducer, DefAccess.private, B> { }

export function createReducerDef<B extends (...args: any) => any>(
  access: DefAccess.public, reducerFn: InternalFrameConsumer<B>): ReducerDef<B>;
export function createReducerDef<B extends (...args: any) => any>(
  access: DefAccess.protected, reducerFn: InternalFrameConsumer<B>): ProtectedReducerDef<B>;
export function createReducerDef<B extends (...args: any) => any>(
  access: DefAccess.private, reducerFn: InternalFrameConsumer<B>): PrivateReducerDef<B>;
export function createReducerDef<B extends (...args: any) => any>(
  access: DefAccess, reducerFn: InternalFrameConsumer<B>) {
  return createActivatorDef(ActivatorDefVariety.reducer, access, reducerFn);
}

export function isReducerDef(obj: any): obj is (ReducerDef<any> | ProtectedReducerDef<any> | PrivateReducerDef<any>);
export function isReducerDef(obj: any, access: DefAccess.public): obj is ReducerDef<any>;
export function isReducerDef(obj: any, access: DefAccess.protected): obj is ProtectedReducerDef<any>;
export function isReducerDef(obj: any, access: DefAccess.private): obj is PrivateReducerDef<any>;
export function isReducerDef(obj: any, access?: DefAccess) {
  return isActivatorDef(obj, ActivatorDefVariety.reducer, access);
}
// #endregion

// --- Trigger
export interface TriggerDef<B extends (...args: any) => ReadonlyArray<Action>>
  extends ActivatorDef<ActivatorDefVariety.trigger, DefAccess.public, B> { }

export interface ProtectedTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>
  extends ActivatorDef<ActivatorDefVariety.trigger, DefAccess.protected, B> { }

export interface PrivateTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>
  extends ActivatorDef<ActivatorDefVariety.trigger, DefAccess.private, B> { }

export function createTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  access: DefAccess.public, reducerFn: InternalFrameConsumer<B>): TriggerDef<B>;
export function createTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  access: DefAccess.protected, reducerFn: InternalFrameConsumer<B>): ProtectedTriggerDef<B>;
export function createTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  access: DefAccess.private, reducerFn: InternalFrameConsumer<B>): PrivateTriggerDef<B>;
export function createTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  access: DefAccess, reducerFn: InternalFrameConsumer<B>) {
  return createActivatorDef(ActivatorDefVariety.trigger, access, reducerFn);
}

export function isTriggerDef(obj: any): obj is (TriggerDef<any> | ProtectedTriggerDef<any> | PrivateTriggerDef<any>);
export function isTriggerDef(obj: any, access: DefAccess.public): obj is TriggerDef<any>;
export function isTriggerDef(obj: any, access: DefAccess.protected): obj is ProtectedTriggerDef<any>;
export function isTriggerDef(obj: any, access: DefAccess.private): obj is PrivateTriggerDef<any>;
export function isTriggerDef(obj: any, access?: DefAccess) {
  return isActivatorDef(obj, ActivatorDefVariety.trigger, access);
}
// #endregion
