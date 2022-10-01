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

export interface GenericSelector<B, A extends AccessModifier>
  extends Descriptor<DescriptorType.selector, FrameConsumer<B>, A> { }

export interface Selector<B> extends GenericSelector<B, AccessModifier.public> { }

export interface PrivateSelector<B> extends GenericSelector<B, AccessModifier.private> { }

export function createSelector
  <B>(selectorFn: FrameConsumer<B>): Selector<B>;
export function createSelector
  <B>(selectorFn: FrameConsumer<B>, access: AccessModifier.public): Selector<B>;
export function createSelector
  <B>(selectorFn: FrameConsumer<B>, access: AccessModifier.private): PrivateSelector<B>;
export function createSelector<B>(selectorFn: FrameConsumer<B>, access: AccessModifier = AccessModifier.public) {
  return createDescriptor(DescriptorType.selector, selectorFn, access);
}

// ---  Derivations
export type BodyOfSelector<L extends GenericSelector<any, any>>
  = L extends GenericSelector<infer B, any> ? B : never;
