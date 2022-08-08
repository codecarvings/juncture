/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createDef, DefAccess, DefType, isDef
} from '../../definition/def';
import { jSymbols } from '../../symbols';

describe('DefType', () => {
  test('should contain the schema type', () => {
    expect(DefType.schema).toBe('scm');
  });

  test('should contain the selector type', () => {
    expect(DefType.selector).toBe('sel');
  });

  test('should contain the paramSelector type', () => {
    expect(DefType.paramSelector).toBe('psl');
  });

  test('should contain the reducer type', () => {
    expect(DefType.reducer).toBe('red');
  });

  test('should contain the trigger type', () => {
    expect(DefType.trigger).toBe('trg');
  });

  test('should contain the reactor type', () => {
    expect(DefType.reactor).toBe('rea');
  });
});

describe('DefAccess', () => {
  test('should contain the public access type', () => {
    expect(DefAccess.public).toBe('pub');
  });

  test('should contain the protected access type', () => {
    expect(DefAccess.protected).toBe('prt');
  });

  test('should contain the private access type', () => {
    expect(DefAccess.private).toBe('prv');
  });
});

describe('createDef', () => {
  test('should create a def by passing type, a payload and an access specifier', () => {
    const type = DefType.selector;
    const payload = () => undefined;
    const access = DefAccess.public;
    const def = createDef(type, payload, access);
    expect(def.type).toBe(type);
    expect(def[jSymbols.defPayload]).toBe(payload);
    expect(def.access).toBe(access);
  });
});

describe('isDef', () => {
  test('should return true if an object is a Def', () => {
    const def = createDef(DefType.schema, () => undefined, DefAccess.public);
    expect(isDef(def)).toBe(true);
  });

  test('should return false if object is not a def', () => {
    expect(isDef('a-string')).toBe(false);
    expect(isDef(1)).toBe(false);
    expect(isDef(true)).toBe(false);
    expect(isDef(undefined)).toBe(false);
    expect(isDef(null)).toBe(false);
  });
});
