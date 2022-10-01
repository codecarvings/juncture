/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DescriptorType } from '../../design/descriptor-type';

describe('DescriptorType', () => {
  test('should contain the schema type', () => {
    expect(DescriptorType.schema).toBe('schema');
  });

  test('should contain the dependency type', () => {
    expect(DescriptorType.dependency).toBe('dependency');
  });

  test('should contain the optDependency type', () => {
    expect(DescriptorType.optDependency).toBe('optDependency');
  });

  test('should contain the resolver type', () => {
    expect(DescriptorType.resolver).toBe('resolver');
  });

  test('should contain the selector type', () => {
    expect(DescriptorType.selector).toBe('selector');
  });

  test('should contain the paramSelector type', () => {
    expect(DescriptorType.paramSelector).toBe('paramSelector');
  });

  test('should contain the reactor type', () => {
    expect(DescriptorType.reactor).toBe('reactor');
  });

  test('should contain the synthReactor type', () => {
    expect(DescriptorType.synthReactor).toBe('synthReactor');
  });

  test('should contain the channel type', () => {
    expect(DescriptorType.channel).toBe('channel');
  });

  test('should contain the procedure type', () => {
    expect(DescriptorType.procedure).toBe('procedure');
  });

  test('should contain the behavior type', () => {
    expect(DescriptorType.behavior).toBe('behavior');
  });
});
