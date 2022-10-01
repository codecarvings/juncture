/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../../access-modifier';
import { isDescriptor } from '../../../design/descriptor';
import { DescriptorType } from '../../../design/descriptor-type';
import { createSchema } from '../../../design/descriptors/schema';
import { junctureSymbols } from '../../../juncture-symbols';
import { JunctureSchema } from '../../../schema';

describe('createSchema', () => {
  test('should create a Schema by passing a schema factory, having publlic access modifier', () => {
    const schemaFactory = () => new JunctureSchema('str');

    const desc = createSchema(schemaFactory);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.schema);
    expect(desc.access).toBe(AccessModifier.public);
    expect(desc[junctureSymbols.payload]).toBe(schemaFactory);
  });
});
