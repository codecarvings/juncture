/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access-modifier';
import { FrameConsumer } from '../../operation/frames/frame';
import { createDescriptor, Descriptor } from '../descriptor';
import { DescriptorType } from '../descriptor-type';

export interface GenericProcedure<B extends (...args: any) => void, A extends AccessModifier>
  extends Descriptor<DescriptorType.procedure, FrameConsumer<B>, A> { }

export interface Procedure<B extends (...args: any) => void>
  extends GenericProcedure<B, AccessModifier.public> { }

export interface PrivateProcedure<B extends (...args: any) => void>
  extends GenericProcedure<B, AccessModifier.private> { }

export function createProcedure<B extends (...args: any) => void>(
  selectorFn: FrameConsumer<B>): Procedure<B>;
export function createProcedure<B extends (...args: any) => void>(
  selectorFn: FrameConsumer<B>, access: AccessModifier.public): Procedure<B>;
export function createProcedure<B extends (...args: any) => void>(
  selectorFn: FrameConsumer<B>, access: AccessModifier.private): PrivateProcedure<B>;
export function createProcedure<B extends (...args: any) => void>(
  selectorFn: FrameConsumer<B>, access: AccessModifier = AccessModifier.public) {
  return createDescriptor(DescriptorType.procedure, selectorFn, access);
}

// ---  Derivations
export type BodyOfProcedure<L extends GenericProcedure<any, any>>
  = L extends GenericProcedure<infer B, any> ? B : never;
