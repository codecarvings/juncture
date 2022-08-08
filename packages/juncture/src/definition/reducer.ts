/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalFrameConsumer } from '../context/frames/internal-frame';
import {
  createDef, Def, DefAccess, DefType
} from './def';

export interface ReducerDef<B extends (...args: any) => any, A extends DefAccess>
  extends Def<DefType.reducer, InternalFrameConsumer<B>, A> { }

export interface PubReducerDef<B extends (...args: any) => any>
  extends ReducerDef<B, DefAccess.public> { }

export interface PrtReducerDef<B extends (...args: any) => any>
  extends ReducerDef<B, DefAccess.protected> { }

export interface PrvReducerDef<B extends (...args: any) => any>
  extends ReducerDef<B, DefAccess.private> { }

export function createReducerDef<B extends (...args: any) => any>(
  reducerFn: InternalFrameConsumer<B>): PubReducerDef<B>;
export function createReducerDef<B extends (...args: any) => any>(
  reducerFn: InternalFrameConsumer<B>, access: DefAccess.public): PubReducerDef<B>;
export function createReducerDef<B extends (...args: any) => any>(
  reducerFn: InternalFrameConsumer<B>, access: DefAccess.protected): PrtReducerDef<B>;
export function createReducerDef<B extends (...args: any) => any>(
  reducerFn: InternalFrameConsumer<B>, access: DefAccess.private): PrvReducerDef<B>;
export function createReducerDef<B extends (...args: any) => any>(
  reducerFn: InternalFrameConsumer<B>, access: DefAccess = DefAccess.public) {
  return createDef(DefType.reducer, reducerFn, access);
}

// ---  Derivations
export type ReducerOfReducerDef<D extends ReducerDef<any, any>>
  = D extends ReducerDef<infer B, any> ? B : never;
