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
  test('should create a definition by passing kind and fn', () => {
    const kind = 'my-definition-type';
    const fn = () => undefined;
    const definition = createDefinition(kind, fn);
    expect(definition[jSymbols.definitionKind]).toBe(kind);
    expect(definition[jSymbols.definitionFn]).toBe(fn);
  });
});

describe('isDefinition', () => {
  let kind: string;
  let fn: (...args: any) => any;
  let definition: Definition;

  beforeEach(() => {
    kind = 'my-definition-type';
    fn = () => undefined;
    definition = createDefinition(kind, fn);
  });

  test('should check if an object is a Definition', () => {
    expect(isDefinition(definition)).toBe(true);
  });

  test('should check if an object is a specific Definition', () => {
    expect(isDefinition(definition, kind)).toBe(true);
  });
});
