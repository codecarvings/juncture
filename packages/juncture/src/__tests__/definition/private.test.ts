/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createDef, DefKind } from '../../definition/def';
import { asPrivate, isPrivate } from '../../definition/private';
import { jSymbols } from '../../symbols';

describe('asPrivate', () => {
  test('should return a new def', () => {
    const def = createDef(DefKind.schema, '', undefined);
    const def2 = asPrivate(def);
    expect(def2).not.toBe(def);
  });

  test('should return a new def with all the properties copied', () => {
    const def = createDef(DefKind.schema, 'test', { test: 1 });
    const def2 = asPrivate(def);
    expect(def2.defKind).toBe(def.defKind);
    expect(def2.defSubKind).toBe(def.defSubKind);
    expect(def2[jSymbols.defPayload]).toBe(def[jSymbols.defPayload]);
  });

  test('should return a def with the property accessModifier set to "private"', () => {
    const def = createDef(DefKind.schema, '', undefined);
    expect((def as any).accessModifier).toBeUndefined();
    const def2 = asPrivate(def);
    expect(def2.access).toBe('private');
  });
});

describe('isPrivate', () => {
  test('should return true if the provided obj is a Private Def', () => {
    const def = createDef(DefKind.schema, '', undefined);
    const privateDef = asPrivate(def);
    expect(isPrivate(privateDef)).toBe(true);
  });

  test('should return false if the provided obj is not a Private Def', () => {
    const def = createDef(DefKind.schema, '', undefined);
    expect(isPrivate(def)).toBe(false);
    expect(isPrivate({})).toBe(false);
    expect(isPrivate(null)).toBe(false);
    expect(isPrivate(undefined)).toBe(false);
  });
});
