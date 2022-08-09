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

export type Reactor<B extends (() => void) | void = (() => void) | void>
  = Descriptor<DescriptorType.reactor, InternalFrameConsumer<B>, AccessModifier.public>;

export type SafeReactor = Reactor<void>;
export type DisposableReactor = Reactor<() => void>;

export function createReactor<B extends (() => void) | void>(
  reactorFn: InternalFrameConsumer<B>): B extends void ? SafeReactor : DisposableReactor {
  return createDescriptor(DescriptorType.reactor, reactorFn, AccessModifier.public) as any;
}

// ---  Derivations
export type BodyOfReactor<D extends Reactor<any>> = D extends Reactor<infer B> ? B : never;
