/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access';
import { FrameConsumer } from '../../engine/frames/frame';
import {
  createDescriptor, Descriptor
} from '../descriptor';
import { DescriptorType } from '../descriptor-type';

export interface GenericReducer<B extends (...args: any) => any, A extends AccessModifier>
  extends Descriptor<DescriptorType.reducer, FrameConsumer<B>, A> { }

export interface Reducer<B extends (...args: any) => any>
  extends GenericReducer<B, AccessModifier.public> { }

export interface PrivateReducer<B extends (...args: any) => any>
  extends GenericReducer<B, AccessModifier.private> { }

export function createReducer<B extends (...args: any) => any>(
  reducerFn: FrameConsumer<B>): Reducer<B>;
export function createReducer<B extends (...args: any) => any>(
  reducerFn: FrameConsumer<B>, access: AccessModifier.public): Reducer<B>;
export function createReducer<B extends (...args: any) => any>(
  reducerFn: FrameConsumer<B>, access: AccessModifier.private): PrivateReducer<B>;
export function createReducer<B extends (...args: any) => any>(
  reducerFn: FrameConsumer<B>, access: AccessModifier = AccessModifier.public) {
  return createDescriptor(DescriptorType.reducer, reducerFn, access);
}

// ---  Derivations
export type BodyOfReducer<L extends GenericReducer<any, any>>
    = L extends GenericReducer<infer B, any> ? B : never;
