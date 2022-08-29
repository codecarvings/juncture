/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access';
import { FrameConsumer } from '../../operation/frames/frame';
import { Instruction } from '../../operation/instruction';
import { createDescriptor, Descriptor } from '../descriptor';
import { DescriptorType } from '../descriptor-type';

export interface GenericSynthReactor<B extends (...args: any) => Instruction[], A extends AccessModifier>
  extends Descriptor<DescriptorType.synthReactor, FrameConsumer<B>, A> { }

export interface SynthReactor<B extends (...args: any) => Instruction[]>
  extends GenericSynthReactor<B, AccessModifier.public> { }

export interface PrivateSynthReactor<B extends (...args: any) => Instruction[]>
  extends GenericSynthReactor<B, AccessModifier.private> { }

export function createSynthReactor<B extends (...args: any) => Instruction[]>(
  reactorFn: FrameConsumer<B>): SynthReactor<B>;
export function createSynthReactor<B extends (...args: any) => Instruction[]>(
  reactorFn: FrameConsumer<B>, access: AccessModifier.public): SynthReactor<B>;
export function createSynthReactor<B extends (...args: any) => Instruction[]>(
  reactorFn: FrameConsumer<B>, access: AccessModifier.private): PrivateSynthReactor<B>;
export function createSynthReactor<B extends (...args: any) => Instruction[]>(
  reactorFn: FrameConsumer<B>, access: AccessModifier = AccessModifier.public) {
  return createDescriptor(DescriptorType.synthReactor, reactorFn, access);
}

// ---  Derivations
export type BodyOfSynthReactor<L extends GenericSynthReactor<any, any>>
  = L extends GenericSynthReactor<infer B, any> ? B : never;
