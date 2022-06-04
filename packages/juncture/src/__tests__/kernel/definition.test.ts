/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createDefinition, Definition, isDefinition } from '../../kernel/definition';
import { jSymbols } from '../../symbols';

describe('createDefinition', () => {
  test('should create a definition by passing kind and a function payload', () => {
    const kind = 'my-definition-type';
    const payload = () => undefined;
    const definition = createDefinition(kind, payload);
    expect(definition[jSymbols.definitionKind]).toBe(kind);
    expect(definition[jSymbols.definitionPayload]).toBe(payload);
  });

  test('should create a definition by passing kind and a value as payload', () => {
    const kind = 'my-definition-type';
    const payload = { val: 123 };
    const definition = createDefinition(kind, payload);
    expect(definition[jSymbols.definitionKind]).toBe(kind);
    expect(definition[jSymbols.definitionPayload]).toBe(payload);
  });
});

describe('isDefinition', () => {
  let kind: string;
  let fn: (...args: any) => any;
  let definition: Definition<any, any>;

  beforeEach(() => {
    kind = 'my-definition-type';
    fn = () => undefined;
    definition = createDefinition(kind, fn);
  });

  test('should check if an object is a Definition', () => {
    expect(isDefinition(definition)).toBe(true);
  });

  test('should check if an object is a specific kind of Definition', () => {
    expect(isDefinition(definition, kind)).toBe(true);
  });

  test('should return false if object is not a definition', () => {
    expect(isDefinition('a-string')).toBe(false);
    expect(isDefinition(1)).toBe(false);
    expect(isDefinition(true)).toBe(false);
    expect(isDefinition(undefined)).toBe(false);
    expect(isDefinition(null)).toBe(false);
  });
});
