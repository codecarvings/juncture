/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access-modifier';
import { DependencyKey, DependencyType } from '../../di/dependency';
import { FrameConsumer } from '../../operation/frames/frame';
import { createDescriptor, Descriptor } from '../descriptor';
import { DescriptorType } from '../descriptor-type';

export interface Resolver<B extends DependencyKey>
  extends Descriptor<DescriptorType.resolver, {
    key: B;
    fn: FrameConsumer<DependencyType<B>>;
  }, AccessModifier.public> { }

export function createResolver<B extends DependencyKey>(key: B, fn: FrameConsumer<DependencyType<B>>): Resolver<B> {
  return createDescriptor(DescriptorType.resolver, { key, fn }, AccessModifier.public);
}
