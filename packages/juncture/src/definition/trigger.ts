/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Action } from '../context/action';
import { InternalFrameConsumer } from '../context/frames/internal-frame';
import {
  createDef, Def, DefAccess, DefType
} from './def';

export interface TriggerDef<B extends (...args: any) => ReadonlyArray<Action>, A extends DefAccess>
  extends Def<DefType.trigger, InternalFrameConsumer<B>, A> { }

export interface PubTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>
  extends TriggerDef<B, DefAccess.public> { }

export interface PrtTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>
  extends TriggerDef<B, DefAccess.protected> { }

export interface PrvTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>
  extends TriggerDef<B, DefAccess.private> { }

export function createTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  reducerFn: InternalFrameConsumer<B>): PubTriggerDef<B>;
export function createTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  reducerFn: InternalFrameConsumer<B>, access: DefAccess.public): PubTriggerDef<B>;
export function createTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  reducerFn: InternalFrameConsumer<B>, access: DefAccess.protected): PrtTriggerDef<B>;
export function createTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  reducerFn: InternalFrameConsumer<B>, access: DefAccess.private): PrvTriggerDef<B>;
export function createTriggerDef<B extends (...args: any) => ReadonlyArray<Action>>(
  reducerFn: InternalFrameConsumer<B>, access: DefAccess = DefAccess.public) {
  return createDef(DefType.trigger, reducerFn, access);
}

// ---  Derivations
export type TriggerOfTriggerDef<D extends TriggerDef<any, any>>
  = D extends TriggerDef<infer B, any> ? B : never;
