/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { InternalFrameConsumer } from '../../engine/frames/internal-frame';
import { AccessModifier } from '../access-modifier';
import {
  createDescriptor
} from '../descriptor';
import { DescriptorType } from '../descriptor-type';
import { DescriptorWithEvents } from '../descriptor-with-events';

type SelectorAccess = AccessModifier.public | AccessModifier.private;

export interface GenericSelector<B, A extends SelectorAccess>
  extends DescriptorWithEvents<DescriptorType.selector, InternalFrameConsumer<B>, {
    change: Observable<B>
  }, A> { }

export interface Selector<B> extends GenericSelector<B, AccessModifier.public> { }

export interface PrivateSelector<B> extends GenericSelector<B, AccessModifier.private> { }

export function createSelector
  <B>(selectorFn: InternalFrameConsumer<B>): Selector<B>;
export function createSelector
  <B>(selectorFn: InternalFrameConsumer<B>, access: AccessModifier.public): Selector<B>;
export function createSelector
  <B>(selectorFn: InternalFrameConsumer<B>, access: AccessModifier.private): PrivateSelector<B>;
export function createSelector<B>(
  selectorFn: InternalFrameConsumer<B>,
  access: SelectorAccess = AccessModifier.public
) {
  return createDescriptor(DescriptorType.selector, selectorFn, access);
}

// ---  Derivations
export type BodyOfSelector<D extends GenericSelector<any, any>>
  = D extends GenericSelector<infer B, any> ? B : never;
