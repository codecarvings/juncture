/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access';
import { FrameConsumer } from '../../operation/frames/frame';
import {
  createDescriptor, Descriptor
} from '../descriptor';
import { DescriptorType } from '../descriptor-type';

export type Behavior<B extends (() => void) | void = (() => void) | void>
  = Descriptor<DescriptorType.behavior, FrameConsumer<B>, AccessModifier.public>;

export type SafeBehavior = Behavior<void>;
export type DisposableBehavior = Behavior<() => void>;

export function createBehavior<B extends (() => void) | void>(
  behaviorFn: FrameConsumer<B>): B extends void ? SafeBehavior : DisposableBehavior {
  return createDescriptor(DescriptorType.behavior, behaviorFn, AccessModifier.public) as any;
}

// ---  Derivations
export type BodyOfBehavior<L extends Behavior<any>> = L extends Behavior<infer B> ? B : never;
