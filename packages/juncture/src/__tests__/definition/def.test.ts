/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createDef, Def, DefAccess, DefType, isDef
} from '../../definition/def';
import { jSymbols } from '../../symbols';

describe('DefType', () => {
  test('should contain the schema type', () => {
    expect(DefType.schema).toBe('schema');
  });

  test('should contain the selector type', () => {
    expect(DefType.selector).toBe('selector');
  });

  test('should contain the reducer type', () => {
    expect(DefType.reducer).toBe('reducer');
  });

  test('should contain the reactor type', () => {
    expect(DefType.reactor).toBe('reactor');
  });
});

describe('createDef', () => {
  test('should create a def by passing type, access and a function payload', () => {
    const type = DefType.selector;
    const access = DefAccess.public;
    const payload = () => undefined;
    const def = createDef(type, access, payload);
    expect(def.type).toBe(type);
    expect(def.access).toBe(access);
    expect(def[jSymbols.defPayload]).toBe(payload);
  });

  test('should create a def by passing type, access and a value as payload', () => {
    const type = DefType.schema;
    const access = DefAccess.public;
    const payload = { val: 123 };
    const def = createDef(type, access, payload);
    expect(def.type).toBe(type);
    expect(def.access).toBe(access);
    expect(def[jSymbols.defPayload]).toBe(payload);
  });
});

describe('isDef', () => {
  let type: DefType;
  let wrongType: DefType;
  let access: DefAccess;
  let wrongAccess: DefAccess;
  let fn: (...args: any) => any;
  let def: Def<any, any, any>;

  beforeEach(() => {
    type = DefType.schema;
    wrongType = DefType.selector;
    access = DefAccess.protected;
    wrongAccess = DefAccess.private;
    fn = () => undefined;
    def = createDef(type, access, fn);
  });

  test('should return true if an object is a Def', () => {
    expect(isDef(def)).toBe(true);
  });

  test('should return true if an object is a specific famiyly of Def', () => {
    expect(isDef(def, type)).toBe(true);
  });

  test('should return false if an object is not a specific type of Def', () => {
    expect(isDef(def, wrongType)).toBe(false);
  });

  test('should return true if an object is a Def has a specific access', () => {
    expect(isDef(def, type, access)).toBe(true);
    expect(isDef(def, undefined, access)).toBe(true);
  });

  test('should return false if an object is a Def has not a specific access', () => {
    expect(isDef(def, type, wrongAccess)).toBe(false);
    expect(isDef(def, undefined, wrongAccess)).toBe(false);
  });

  test('should return false if object is not a def', () => {
    expect(isDef('a-string')).toBe(false);
    expect(isDef(1)).toBe(false);
    expect(isDef(true)).toBe(false);
    expect(isDef(undefined)).toBe(false);
    expect(isDef(null)).toBe(false);
  });
});
