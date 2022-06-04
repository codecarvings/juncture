/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchemaDefinition, Schema, schemaDefinitionKind } from '../../kernel/schema';
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

describe('schemaDefinitionKind', () => {
  test('should contain "schema"', () => {
    expect(schemaDefinitionKind).toBe('schema');
  });
});

describe('createSchemaDefinition', () => {
  test('should create a SchemaDefinition by passing a schema factory', () => {
    class MySchema extends Schema<string> {
      constructor() {
        super('str');
      }
    }
    const schemaFactory = () => new MySchema();

    const definition = createSchemaDefinition(schemaFactory);
    expect(definition[jSymbols.definitionKind]).toBe(schemaDefinitionKind);
    expect(definition[jSymbols.definitionPayload]).toBe(schemaFactory);
    expect((definition as any)[jSymbols.paramSelectorTag]).toBeUndefined();
  });
});
