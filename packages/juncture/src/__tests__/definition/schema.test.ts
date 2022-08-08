/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefAccess, DefType, isDef } from '../../definition/def';
import { createSchemaDef, Schema } from '../../definition/schema';
import { jSymbols } from '../../symbols';

describe('Schema', () => {
  const defaultValue = { value: 'str' };
  test('should be a class instantiable by passing a defaultValue', () => {
    const schema = new Schema(defaultValue);
    expect(schema).toBeInstanceOf(Schema);
  });

  describe('instance', () => {
    test('should have a "defaultValue" property that returns the value provided in the constructor', () => {
      const schema = new Schema(defaultValue);
      expect(schema.defaultValue).toBe(defaultValue);
    });
  });
});

describe('createSchemaDef', () => {
  test('should create a SchemaDef by passing a schema factory with access public', () => {
    const schemaFactory = () => new Schema('str');

    const def = createSchemaDef(schemaFactory);
    expect(isDef(def)).toBe(true);
    expect(def.type).toBe(DefType.schema);
    expect(def.access).toBe(DefAccess.public);
    expect(def[jSymbols.defPayload]).toBe(schemaFactory);
  });
});
