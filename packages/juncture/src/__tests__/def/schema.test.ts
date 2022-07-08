/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createDef, DefKind } from '../../def/def';
import { createSchemaDef, isSchemaDef, Schema } from '../../def/schema';
import { jSymbols } from '../../symbols';

describe('Schema', () => {
  const defaultValue = 'str';
  class MySchema extends Schema<string> {
    constructor() {
      super(defaultValue);
    }
  }

  test('should be a class instantiable by passing a defaultValue', () => {
    const schema = new MySchema();
    expect(schema).toBeInstanceOf(MySchema);
  });

  describe('instance', () => {
    test('should have a defaultValue property', () => {
      const schema = new MySchema();
      expect(schema.defaultValue).toBe(defaultValue);
    });
  });
});

describe('createSchemaDef', () => {
  test('should create a SchemaDef by passing a schema factory', () => {
    class MySchema extends Schema<string> {
      constructor() {
        super('str');
      }
    }
    const schemaFactory = () => new MySchema();

    const def = createSchemaDef(schemaFactory);
    expect(def.defKind).toBe(DefKind.schema);
    expect(def.defSubKind).toBe('');
    expect(def[jSymbols.defPayload]).toBe(schemaFactory);
  });
});

describe('isSchemaDef', () => {
  test('should return true if an object is a SchemaDef', () => {
    class MySchema extends Schema<string> {
      constructor() {
        super('str');
      }
    }
    const schemaFactory = () => new MySchema();

    const def = createSchemaDef(schemaFactory);
    expect(isSchemaDef(def)).toBe(true);
  });

  test('should return false if an object is not a SchemaDef', () => {
    expect(isSchemaDef(createDef(DefKind.selector, '', undefined))).toBe(false);
    expect(isSchemaDef(null)).toBe(false);
    expect(isSchemaDef(undefined)).toBe(false);
    expect(isSchemaDef('dummy')).toBe(false);
  });
});
