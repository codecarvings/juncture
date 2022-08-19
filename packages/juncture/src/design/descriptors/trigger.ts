/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalFrameConsumer } from '../../engine/frames/internal-frame';
import { Instruction } from '../../engine/instruction';
import { AccessModifier } from '../access-modifier';
import {
  createDescriptor, Descriptor
} from '../descriptor';
import { DescriptorType } from '../descriptor-type';

export interface GenericTrigger<B extends (...args: any) => Instruction[], A extends AccessModifier>
  extends Descriptor<DescriptorType.trigger, InternalFrameConsumer<B>, A> { }

export interface Trigger<B extends (...args: any) => Instruction[]>
  extends GenericTrigger<B, AccessModifier.public> { }

export interface ProtectedTrigger<B extends (...args: any) => Instruction[]>
  extends GenericTrigger<B, AccessModifier.protected> { }

export interface PrivateTrigger<B extends (...args: any) => Instruction[]>
  extends GenericTrigger<B, AccessModifier.private> { }

export function createTrigger<B extends (...args: any) => Instruction[]>(
  triggerFn: InternalFrameConsumer<B>): Trigger<B>;
export function createTrigger<B extends (...args: any) => Instruction[]>(
  triggerFn: InternalFrameConsumer<B>, access: AccessModifier.public): Trigger<B>;
export function createTrigger<B extends (...args: any) => Instruction[]>(
  triggerFn: InternalFrameConsumer<B>, access: AccessModifier.protected): ProtectedTrigger<B>;
export function createTrigger<B extends (...args: any) => Instruction[]>(
  triggerFn: InternalFrameConsumer<B>, access: AccessModifier.private): PrivateTrigger<B>;
export function createTrigger<B extends (...args: any) => Instruction[]>(
  triggerFn: InternalFrameConsumer<B>, access: AccessModifier = AccessModifier.public) {
  return createDescriptor(DescriptorType.trigger, triggerFn, access);
}

// ---  Derivations
export type BodyOfTrigger<D extends GenericTrigger<any, any>>
  = D extends GenericTrigger<infer B, any> ? B : never;
