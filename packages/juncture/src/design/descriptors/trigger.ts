/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access';
import { FrameConsumer } from '../../engine/frames/frame';
import { Instruction } from '../../engine/instruction';
import {
  createDescriptor, Descriptor
} from '../descriptor';
import { DescriptorType } from '../descriptor-type';

export interface GenericTrigger<B extends (...args: any) => Instruction[], A extends AccessModifier>
  extends Descriptor<DescriptorType.trigger, FrameConsumer<B>, A> { }

export interface Trigger<B extends (...args: any) => Instruction[]>
  extends GenericTrigger<B, AccessModifier.public> { }

export interface PrivateTrigger<B extends (...args: any) => Instruction[]>
  extends GenericTrigger<B, AccessModifier.private> { }

export function createTrigger<B extends (...args: any) => Instruction[]>(
  triggerFn: FrameConsumer<B>): Trigger<B>;
export function createTrigger<B extends (...args: any) => Instruction[]>(
  triggerFn: FrameConsumer<B>, access: AccessModifier.public): Trigger<B>;
export function createTrigger<B extends (...args: any) => Instruction[]>(
  triggerFn: FrameConsumer<B>, access: AccessModifier.private): PrivateTrigger<B>;
export function createTrigger<B extends (...args: any) => Instruction[]>(
  triggerFn: FrameConsumer<B>, access: AccessModifier = AccessModifier.public) {
  return createDescriptor(DescriptorType.trigger, triggerFn, access);
}

// ---  Derivations
export type BodyOfTrigger<L extends GenericTrigger<any, any>>
  = L extends GenericTrigger<infer B, any> ? B : never;
