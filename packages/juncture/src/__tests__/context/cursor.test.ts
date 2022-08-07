/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Ctx, CtxLayout, CtxMediator } from '../../context/ctx';
import { isCtxHost } from '../../context/ctx-host';
import { createCursor } from '../../context/cursor';
import { createSchemaDef, Schema } from '../../definition/schema';
import { Juncture } from '../../juncture';

class MyJuncture extends Juncture {
  schema = createSchemaDef(() => new Schema(''));
}
const juncture = Juncture.getInstance(MyJuncture);
const layout: CtxLayout = {
  parent: null,
  path: [],
  isDivergent: false,
  isUnivocal: true
};
const mediator: CtxMediator = {
  enroll: () => { },
  getValue: () => undefined,
  setValue: () => { },
  dispatch: () => {}
};

const ctx1 = new Ctx(juncture, layout, mediator);
const ctx2 = new Ctx(juncture, layout, mediator);

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
