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

export interface GenericParamSelector<B extends (...args: any) => any, A extends AccessModifier>
  extends Descriptor<DescriptorType.paramSelector, FrameConsumer<B>, A> { }

export interface ParamSelector<B extends (...args: any) => any>
  extends GenericParamSelector<B, AccessModifier.public> { }

export interface PrivateParamSelector<B extends (...args: any) => any>
  extends GenericParamSelector<B, AccessModifier.private> { }

export function createParamSelector<B extends (...args: any) => any>(
  selectorFn: FrameConsumer<B>): ParamSelector<B>;
export function createParamSelector<B extends (...args: any) => any>(
  selectorFn: FrameConsumer<B>, access: AccessModifier.public): ParamSelector<B>;
export function createParamSelector<B extends (...args: any) => any>(
  selectorFn: FrameConsumer<B>, access: AccessModifier.private): PrivateParamSelector<B>;
export function createParamSelector<B extends (...args: any) => any>(
  selectorFn: FrameConsumer<B>, access: AccessModifier = AccessModifier.public) {
  return createDescriptor(DescriptorType.paramSelector, selectorFn, access);
}

// ---  Derivations
export type BodyOfParamSelector<L extends GenericParamSelector<any, any>>
  = L extends GenericParamSelector<infer B, any> ? B : never;
