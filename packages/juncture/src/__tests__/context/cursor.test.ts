/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Ctx, CtxConfig } from '../../context/ctx';
import { isCtxHost } from '../../context/ctx-host';
import { createCursor } from '../../context/cursor';
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
  },
  rootMediator: {
    dispatch: () => {}
  }
};
const ctx1 = new Ctx(juncture, config);
const ctx2 = new Ctx(juncture, config);

describe('createCursor', () => {
  test('should create a cursor by passing a ctx', () => {
    const cursor = createCursor(ctx1);
    expect(isCtxHost(cursor)).toBe(true);
  });

  test('should create a cursor associated with the original ctx', () => {
    const cursor = createCursor(ctx1);

    expect(isCtxHost(cursor, ctx1)).toBe(true);
    expect(isCtxHost(cursor, ctx2)).toBe(false);
  });
});
