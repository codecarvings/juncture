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

export interface GenericReactor<B extends (...args: any) => any, A extends AccessModifier>
  extends Descriptor<DescriptorType.reactor, FrameConsumer<B>, A> { }

export interface Reactor<B extends (...args: any) => any>
  extends GenericReactor<B, AccessModifier.public> { }

export interface PrivateReactor<B extends (...args: any) => any>
  extends GenericReactor<B, AccessModifier.private> { }

export function createReactor<B extends (...args: any) => any>(
  reactorFn: FrameConsumer<B>): Reactor<B>;
export function createReactor<B extends (...args: any) => any>(
  reactorFn: FrameConsumer<B>, access: AccessModifier.public): Reactor<B>;
export function createReactor<B extends (...args: any) => any>(
  reactorFn: FrameConsumer<B>, access: AccessModifier.private): PrivateReactor<B>;
export function createReactor<B extends (...args: any) => any>(
  reactorFn: FrameConsumer<B>, access: AccessModifier = AccessModifier.public) {
  return createDescriptor(DescriptorType.reactor, reactorFn, access);
}

// ---  Derivations
export type BodyOfReactor<L extends GenericReactor<any, any>>
    = L extends GenericReactor<infer B, any> ? B : never;
