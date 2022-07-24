/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Ctx, CtxConfig } from '../../context/ctx';
import { createCursor, Cursor, isCursor } from '../../context/cursor';
import { createSchemaDef, Schema } from '../../definition/schema';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';

describe('Ctx', () => {
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
    }
  };

  test('should be instantiable by passing a juncture and a CtxConfig object', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const ctx = new Ctx(juncture, config);
    }).not.toThrow();
  });

  describe('instance', () => {
    let ctx: Ctx<MyJuncture>;
    beforeEach(() => {
      ctx = new Ctx(juncture, config);
    });

    test('should have a "juncture" property containing a reference to the original Juncture', () => {
      expect(ctx.juncture).toBe(juncture);
    });

    test('should have a "layout" property containing the same value of the provided config', () => {
      expect(ctx.layout).toBe(config.layout);
    });

    // eslint-disable-next-line max-len
    test('should have a "cursor" property that give access to a cursor associated with the ctx', () => {
      expect(isCursor(ctx.cursor, ctx)).toBe(true);
    });

    describe('privateCursor property', () => {
      describe('by default', () => {
        test('should give access to the same value provided by the "cursor" property', () => {
          expect(ctx.privateCursor).toBe(ctx.cursor);
        });
      });

      describe('when createPrivateCursor factory is overridden and return a different cursor', () => {
        class MyCtx<J extends MyJuncture2> extends Ctx<J> {
          protected createPrivateCursor(): Cursor<this['juncture']> {
            return createCursor(this);
          }
        }

        class MyJuncture2 extends Juncture {
          [jSymbols.createCtx](config2: CtxConfig): MyCtx<this> {
            return new MyCtx(this, config2);
          }

          schema = createSchemaDef(() => new Schema(''));
        }
        const juncture2 = Juncture.getInstance(MyJuncture2);

        test('should give access to the new cursor', () => {
          const ctx2 = new MyCtx(juncture2, config);
          expect(isCursor(ctx2.privateCursor, ctx2)).toBe(true);
          expect(ctx2.privateCursor).not.toBe(ctx.cursor);
        });
      });
    });
  });
});
