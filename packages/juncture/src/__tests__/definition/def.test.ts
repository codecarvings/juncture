/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createDef, Def, DefKind, isDef
} from '../../definition/def';
import { jSymbols } from '../../symbols';

describe('DefKind', () => {
  test('should contain the schema kind', () => {
    expect(DefKind.schema).toBe('schema');
  });

  test('should contain the selector kind', () => {
    expect(DefKind.selector).toBe('selector');
  });

  test('should contain the reducer kind', () => {
    expect(DefKind.reducer).toBe('reducer');
  });
});

describe('createDef', () => {
  test('should create a def by passing kind, subKind and a function payload', () => {
    const kind = DefKind.selector;
    const subKind = 'test';
    const payload = () => undefined;
    const def = createDef(kind, subKind, payload);
    expect(def.defKind).toBe(kind);
    expect(def.defSubKind).toBe(subKind);
    expect(def[jSymbols.defPayload]).toBe(payload);
  });

  test('should create a def by passing kind and a value as payload', () => {
    const kind = DefKind.schema;
    const subKind = 'test';
    const payload = { val: 123 };
    const def = createDef(kind, subKind, payload);
    expect(def.defKind).toBe(kind);
    expect(def.defSubKind).toBe(subKind);
    expect(def[jSymbols.defPayload]).toBe(payload);
  });
});

describe('isDef', () => {
  let kind: DefKind;
  let wrongKind: DefKind;
  let subKind: string;
  let wrongSubKind: string;
  let fn: (...args: any) => any;
  let def: Def<any, any, any>;

  beforeEach(() => {
    kind = DefKind.schema;
    wrongKind = DefKind.selector;
    subKind = 'my-def-sub-kind';
    wrongSubKind = 'my-wrong-def-sub-kind';
    fn = () => undefined;
    def = createDef(kind, subKind, fn);
  });

  test('should return true if an object is a Def', () => {
    expect(isDef(def)).toBe(true);
  });

  test('should return true if an object is a specific kind of Def', () => {
    expect(isDef(def, kind)).toBe(true);
  });

  test('should return false if an object is not a specific kind of Def', () => {
    expect(isDef(def, wrongKind)).toBe(false);
  });

  test('should return true if an object is a specific subKind of Def', () => {
    expect(isDef(def, kind, subKind)).toBe(true);
    expect(isDef(def, undefined, subKind)).toBe(true);
  });

  test('should return false if an object is not a specific subKind of Def', () => {
    expect(isDef(def, kind, wrongSubKind)).toBe(false);
    expect(isDef(def, undefined, wrongSubKind)).toBe(false);
  });

  test('should return false if object is not a def', () => {
    expect(isDef('a-string')).toBe(false);
    expect(isDef(1)).toBe(false);
    expect(isDef(true)).toBe(false);
    expect(isDef(undefined)).toBe(false);
    expect(isDef(null)).toBe(false);
  });
});
