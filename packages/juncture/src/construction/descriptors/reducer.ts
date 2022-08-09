/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalFrameConsumer } from '../../engine/frames/internal-frame';
import { AccessModifier } from '../access-modifier';
import {
  createDescriptor, Descriptor, DescriptorType
} from '../descriptor';

export interface GenericReducer<B extends (...args: any) => any, A extends AccessModifier>
  extends Descriptor<DescriptorType.reducer, InternalFrameConsumer<B>, A> { }

export interface Reducer<B extends (...args: any) => any>
  extends GenericReducer<B, AccessModifier.public> { }

export interface ProtectedReducer<B extends (...args: any) => any>
  extends GenericReducer<B, AccessModifier.protected> { }

export interface PrivateReducer<B extends (...args: any) => any>
  extends GenericReducer<B, AccessModifier.private> { }

export function createReducer<B extends (...args: any) => any>(
  reducerFn: InternalFrameConsumer<B>): Reducer<B>;
export function createReducer<B extends (...args: any) => any>(
  reducerFn: InternalFrameConsumer<B>, access: AccessModifier.public): Reducer<B>;
export function createReducer<B extends (...args: any) => any>(
  reducerFn: InternalFrameConsumer<B>, access: AccessModifier.protected): ProtectedReducer<B>;
export function createReducer<B extends (...args: any) => any>(
  reducerFn: InternalFrameConsumer<B>, access: AccessModifier.private): PrivateReducer<B>;
export function createReducer<B extends (...args: any) => any>(
  reducerFn: InternalFrameConsumer<B>, access: AccessModifier = AccessModifier.public) {
  return createDescriptor(DescriptorType.reducer, reducerFn, access);
}

// ---  Derivations
export type BodyOfReducer<D extends GenericReducer<any, any>>
  = D extends GenericReducer<infer B, any> ? B : never;
