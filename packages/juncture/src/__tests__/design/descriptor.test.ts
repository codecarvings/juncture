/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access';
import {
  createDescriptor, isDescriptor
} from '../../design/descriptor';
import { DescriptorType } from '../../design/descriptor-type';
import { jSymbols } from '../../symbols';

describe('createDescriptor', () => {
  test('should create a Descriptor by passing type, a payload and an access specifier', () => {
    const type = DescriptorType.selector;
    const payload = () => undefined;
    const access = AccessModifier.public;
    const desc = createDescriptor(type, payload, access);
    expect(desc.type).toBe(type);
    expect(desc[jSymbols.payload]).toBe(payload);
    expect(desc.access).toBe(access);
  });
});

describe('isDescriptor', () => {
  test('should return true if an object is a Descriptor', () => {
    const desc = createDescriptor(DescriptorType.schema, () => undefined, AccessModifier.public);
    expect(isDescriptor(desc)).toBe(true);
  });

  test('should return false if object is not a Descriptor', () => {
    expect(isDescriptor('a-string')).toBe(false);
    expect(isDescriptor(1)).toBe(false);
    expect(isDescriptor(true)).toBe(false);
    expect(isDescriptor(undefined)).toBe(false);
    expect(isDescriptor(null)).toBe(false);
  });
});
