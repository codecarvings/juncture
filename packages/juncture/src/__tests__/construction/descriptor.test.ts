/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../construction/access-modifier';
import {
  createDescriptor, DescriptorType, isDescriptor
} from '../../construction/descriptor';
import { jSymbols } from '../../symbols';

describe('DescriptorType', () => {
  test('should contain the schema type', () => {
    expect(DescriptorType.schema).toBe('scm');
  });

  test('should contain the selector type', () => {
    expect(DescriptorType.selector).toBe('sel');
  });

  test('should contain the paramSelector type', () => {
    expect(DescriptorType.paramSelector).toBe('psl');
  });

  test('should contain the reducer type', () => {
    expect(DescriptorType.reducer).toBe('red');
  });

  test('should contain the trigger type', () => {
    expect(DescriptorType.trigger).toBe('trg');
  });

  test('should contain the reactor type', () => {
    expect(DescriptorType.reactor).toBe('rea');
  });
});

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
