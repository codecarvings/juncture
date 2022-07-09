/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createDef, DefKind } from '../../def/def';
import { asPrivate } from '../../def/private';
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
