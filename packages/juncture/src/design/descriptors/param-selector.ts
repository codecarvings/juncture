/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { InternalFrameConsumer } from '../../engine/frames/internal-frame';
import { OverloadParameters, OverloadReturnType } from '../../tool/overload-types';
import { AccessModifier } from '../access-modifier';
import {
  createDescriptor, Descriptor
} from '../descriptor';
import { DescriptorType } from '../descriptor-type';

export type ParamSelectorAccess = AccessModifier.public | AccessModifier.private;

export interface GenericParamSelector<B extends (...args: any) => any, A extends ParamSelectorAccess>
  extends Descriptor<DescriptorType.paramSelector, InternalFrameConsumer<B>, A> { }

export interface ParamSelector<B extends (...args: any) => any>
  extends GenericParamSelector<B, AccessModifier.public> { }

export interface PrivateParamSelector<B extends (...args: any) => any>
  extends GenericParamSelector<B, AccessModifier.private> { }

export function createParamSelector<B extends (...args: any) => any>(
  selectorFn: InternalFrameConsumer<B>): ParamSelector<B>;
export function createParamSelector<B extends (...args: any) => any>(
  selectorFn: InternalFrameConsumer<B>, access: AccessModifier.public): ParamSelector<B>;
export function createParamSelector<B extends (...args: any) => any>(
  selectorFn: InternalFrameConsumer<B>, access: AccessModifier.private): PrivateParamSelector<B>;
export function createParamSelector<B extends (...args: any) => any>(
  selectorFn: InternalFrameConsumer<B>, access: ParamSelectorAccess = AccessModifier.public) {
  return createDescriptor(DescriptorType.paramSelector, selectorFn, access);
}

// ---  Derivations
export type BodyOfParamSelector<D extends GenericParamSelector<any, any>>
  = D extends GenericParamSelector<infer B, any> ? B : never;

// #region Observables
export interface ParamSelectorObservables<B extends (...args: any) => any> {
  change(...args : OverloadParameters<B>): Observable<OverloadReturnType<B>>
}
// #endregion
