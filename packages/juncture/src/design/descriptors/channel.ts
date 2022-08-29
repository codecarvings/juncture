/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access';
import {
  createDescriptor, Descriptor
} from '../descriptor';
import { DescriptorType } from '../descriptor-type';

export interface GenericChannel<B, A extends AccessModifier>
  extends Descriptor<DescriptorType.channel, B, A> { }

export interface Channel<B>
  extends GenericChannel<B, AccessModifier.public> { }

export interface PrivateChannel<B>
  extends GenericChannel<B, AccessModifier.private> { }

export function createChannel<B>(): Channel<B>;
export function createChannel<B>(access: AccessModifier.public): Channel<B>;
export function createChannel<B>(access: AccessModifier.private): PrivateChannel<B>;
export function createChannel(access: AccessModifier = AccessModifier.public) {
  return createDescriptor(DescriptorType.channel, undefined, access);
}
