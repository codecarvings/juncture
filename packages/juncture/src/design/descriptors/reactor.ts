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

export type Reactor<B extends (() => void) | void = (() => void) | void>
  = Descriptor<DescriptorType.reactor, FrameConsumer<B>, AccessModifier.public>;

export type SafeReactor = Reactor<void>;
export type DisposableReactor = Reactor<() => void>;

export function createReactor<B extends (() => void) | void>(
  reactorFn: FrameConsumer<B>): B extends void ? SafeReactor : DisposableReactor {
  return createDescriptor(DescriptorType.reactor, reactorFn, AccessModifier.public) as any;
}

// ---  Derivations
export type BodyOfReactor<L extends Reactor<any>> = L extends Reactor<infer B> ? B : never;
