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

export interface OpenChannel<B>
  extends Descriptor<DescriptorType.openChannel, B, AccessModifier.public> { }

export function createOpenChannel<B>(): OpenChannel<B> {
  return createDescriptor(DescriptorType.openChannel, undefined!, AccessModifier.public);
}
