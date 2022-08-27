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

  test('should contain the selector type', () => {
    expect(DescriptorType.selector).toBe('selector');
  });

  test('should contain the paramSelector type', () => {
    expect(DescriptorType.paramSelector).toBe('paramSelector');
  });

  test('should contain the trigger type', () => {
    expect(DescriptorType.trigger).toBe('trigger');
  });

  test('should contain the reducer type', () => {
    expect(DescriptorType.reducer).toBe('reducer');
  });

  test('should contain the reactor type', () => {
    expect(DescriptorType.reactor).toBe('reactor');
  });
});
