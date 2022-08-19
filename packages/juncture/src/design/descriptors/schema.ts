/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../access-modifier';
import {
  createDescriptor, Descriptor
} from '../descriptor';
import { DescriptorType } from '../descriptor-type';
import { JunctureSchema } from '../schema';

export type Schema<B extends JunctureSchema> =
  Descriptor<DescriptorType.schema, () => B, AccessModifier.public>;

export function createSchema<B extends JunctureSchema>(schemaFactory: () => B): Schema<B> {
  return createDescriptor(DescriptorType.schema, schemaFactory, AccessModifier.public);
}

// ---  Derivations
export type BodyOfSchema<D extends Schema<JunctureSchema>> =
  D extends Schema<infer B> ? B : never;
