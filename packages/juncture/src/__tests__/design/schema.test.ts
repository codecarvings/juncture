/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { JunctureSchema } from '../../design/schema';

describe('Schema', () => {
  const defaultValue = { value: 'str' };
  test('should be a class instantiable by passing a defaultValue', () => {
    const schema = new JunctureSchema(defaultValue);
    expect(schema).toBeInstanceOf(JunctureSchema);
  });

  describe('instance', () => {
    test('should have a "defaultValue" property that returns the value provided in the constructor', () => {
      const schema = new JunctureSchema(defaultValue);
      expect(schema.defaultValue).toBe(defaultValue);
    });
  });
});
