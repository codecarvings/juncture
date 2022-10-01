/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access-modifier';
import { DependencyKey } from '../../di/dependency';
import { createDescriptor, Descriptor } from '../descriptor';
import { DescriptorType } from '../descriptor-type';

export interface OptDependency<B extends DependencyKey>
  extends Descriptor<DescriptorType.optDependency, B, AccessModifier.public> { }

export function createOptDependency<B extends DependencyKey>(key: B): OptDependency<B> {
  return createDescriptor(DescriptorType.optDependency, key, AccessModifier.public);
}
