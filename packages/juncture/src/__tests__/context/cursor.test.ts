/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Ctx, CtxConfig } from '../../context/ctx';
import { createCursor, getCtx, isCursor } from '../../context/cursor';
import { createSchemaDef, Schema } from '../../definition/schema';
import { Juncture } from '../../juncture';

class MyJuncture extends Juncture {
  schema = createSchemaDef(() => new Schema(''));
}
const juncture = Juncture.getInstance(MyJuncture);
const config: CtxConfig = {
  layout: {
    parent: null,
    path: [],
    isDivergent: false,
    isUnivocal: true
  },
  ctxMediator: {
    getValue: () => undefined,
    setValue: () => {}
  }
};
const ctx1 = new Ctx(juncture, config);
const ctx2 = new Ctx(juncture, config);

describe('createCursor', () => {
  test('should create a cursor by passing a ctx', () => {
    const cursor = createCursor(ctx1);
    expect(isCursor(cursor)).toBe(true);
  });

  test('should create a cursor associated with the original ctx', () => {
    const cursor = createCursor(ctx1);

    expect(isCursor(cursor, ctx1)).toBe(true);
    expect(isCursor(cursor, ctx2)).toBe(false);
  });
});

describe('getCtx', () => {
  test('should return the ctx associated to the cursor', () => {
    const cursor1 = createCursor(ctx1);
    const cursor2 = createCursor(ctx2);

    expect(getCtx(cursor1)).toBe(ctx1);
    expect(getCtx(cursor2)).toBe(ctx2);
  });
});

describe('isCursor', () => {
  describe('when no "ctx" argument is provided', () => {
    test('should return true if object is a cursor', () => {
      const cursor = createCursor(ctx1);
      expect(isCursor(cursor)).toBe(true);
    });
    test('should return false if object is not a cursor', () => {
      expect(isCursor('a-string')).toBe(false);
      expect(isCursor(1)).toBe(false);
      expect(isCursor(true)).toBe(false);
      expect(isCursor(undefined)).toBe(false);
      expect(isCursor(null)).toBe(false);
    });
  });

  describe('when "ctx" argument is provided', () => {
    test('should return true if object is a cursor associated with the provided ctx', () => {
      const cursor = createCursor(ctx1);
      expect(isCursor(cursor, ctx1)).toBe(true);
    });
    test('should return false if object is not a cursor associated with the provided ctx', () => {
      const cursor = createCursor(ctx1);
      expect(isCursor(cursor, ctx2)).toBe(false);
    });
    test('should return false if object is not a cursor', () => {
      expect(isCursor('a-string', ctx1)).toBe(false);
      expect(isCursor(1, ctx1)).toBe(false);
      expect(isCursor(true, ctx1)).toBe(false);
      expect(isCursor(undefined, ctx1)).toBe(false);
      expect(isCursor(null, ctx1)).toBe(false);
    });
  });
});
