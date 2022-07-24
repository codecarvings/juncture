/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createDef, DefKind } from '../../definition/def';
import { createSchemaDef, isSchemaDef, Schema } from '../../definition/schema';
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
  test('should create a SchemaDef by passing a schema factory', () => {
    const schemaFactory = () => new Schema('str');

    const def = createSchemaDef(schemaFactory);
    expect(def.defKind).toBe(DefKind.schema);
    expect(def.defSubKind).toBe('');
    expect(def[jSymbols.defPayload]).toBe(schemaFactory);
  });
});

describe('isSchemaDef', () => {
  test('should return true if an object is a SchemaDef', () => {
    const def = createSchemaDef(() => new Schema(''));
    expect(isSchemaDef(def)).toBe(true);
  });

  test('should return false if an object is not a SchemaDef', () => {
    expect(isSchemaDef(createDef(DefKind.selector, '', undefined))).toBe(false);
    expect(isSchemaDef(null)).toBe(false);
    expect(isSchemaDef(undefined)).toBe(false);
    expect(isSchemaDef('dummy')).toBe(false);
  });
});
