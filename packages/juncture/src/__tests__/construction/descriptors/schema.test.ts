/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../../construction/access-modifier';
import { DescriptorType, isDescriptor } from '../../../construction/descriptor';
import { createSchema } from '../../../construction/descriptors/schema';
import { JunctureSchema } from '../../../construction/schema';
import { jSymbols } from '../../../symbols';

describe('createSchema', () => {
  test('should create a Schema by passing a schema factory, having publlic access modifier', () => {
    const schemaFactory = () => new JunctureSchema('str');

    const desc = createSchema(schemaFactory);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.schema);
    expect(desc.access).toBe(AccessModifier.public);
    expect(desc[jSymbols.payload]).toBe(schemaFactory);
  });
});
