/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Ctx, CtxConfig } from '../../context/ctx';
import { isCtxHost } from '../../context/ctx-host';
import { CtxHub } from '../../context/ctx-hub';
import { createCursor, Cursor } from '../../context/cursor';
import { createSchemaDef, Schema, SchemaDef } from '../../definition/schema';
import { Juncture, JunctureType } from '../../juncture';
import { jSymbols } from '../../symbols';

describe('Ctx', () => {
  interface MyJuncture extends Juncture {
    schema: SchemaDef<Schema<string>>;
  }
  let MyJunctureType: JunctureType<MyJuncture>;
  let juncture: MyJuncture;
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

  beforeEach(() => {
    MyJunctureType = class extends Juncture {
      schema = createSchemaDef(() => new Schema(''));
    };
    juncture = Juncture.getInstance(MyJunctureType);
  });

  describe('constructor', () => {
    test('should accept a juncture and a CtxConfig object', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const ctx = new Ctx(juncture, config);
      }).not.toThrow();
    });

    test('should invoke the juncture[jSymbols.createCtxHub] factory to create a new hub for the ctx', () => {
      (juncture as any)[jSymbols.createCtxHub] = jest.fn(juncture[jSymbols.createCtxHub]);
      expect(juncture[jSymbols.createCtxHub]).toBeCalledTimes(0);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const ctx = new Ctx(juncture, config);
      expect(juncture[jSymbols.createCtxHub]).toBeCalledTimes(1);
    });
  });

  describe('instance', () => {
    let ctx: Ctx;
    beforeEach(() => {
      ctx = new Ctx(juncture, config);
    });

    test('should have a "juncture" property containing a reference to the original Juncture', () => {
      expect(ctx.juncture).toBe(juncture);
    });

    test('should have a "layout" property containing the same value of the provided config', () => {
      expect(ctx.layout).toBe(config.layout);
    });

    describe('cursor property', () => {
      test('should give access to a cursor associated with the ctx', () => {
        expect(isCtxHost(ctx.cursor, ctx)).toBe(true);
      });

      test('should invoke the juncture[jSymbols.createCursor] factory only once the first time is accessed', () => {
        (juncture as any)[jSymbols.createCursor] = jest.fn(juncture[jSymbols.createCursor]);
        expect(juncture[jSymbols.createCursor]).toBeCalledTimes(0);
        expect(isCtxHost(ctx.cursor, ctx)).toBe(true);
        expect(juncture[jSymbols.createCursor]).toBeCalledTimes(1);
        expect(isCtxHost(ctx.cursor, ctx)).toBe(true);
        expect(juncture[jSymbols.createCursor]).toBeCalledTimes(1);
      });
    });

    describe('privateCursor property', () => {
      test('should give access to a cursor associated with the ctx', () => {
        expect(isCtxHost(ctx.cursor, ctx)).toBe(true);
      });

      // eslint-disable-next-line max-len
      test('should invoke the juncture[jSymbols.createPrivateCursor] factory only once the first time is accessed', () => {
        (juncture as any)[jSymbols.createPrivateCursor] = jest.fn(juncture[jSymbols.createPrivateCursor]);
        expect(juncture[jSymbols.createPrivateCursor]).toBeCalledTimes(0);
        expect(isCtxHost(ctx.privateCursor, ctx)).toBe(true);
        expect(juncture[jSymbols.createPrivateCursor]).toBeCalledTimes(1);
        expect(isCtxHost(ctx.privateCursor, ctx)).toBe(true);
        expect(juncture[jSymbols.createPrivateCursor]).toBeCalledTimes(1);
      });

      describe('by default', () => {
        test('should give access to the same value provided by the "cursor" property', () => {
          expect(ctx.privateCursor).toBe(ctx.cursor);
        });
      });

      // eslint-disable-next-line max-len
      describe('when [jSymbols.createPrivateCursor] factory is overridden in the Juncture and return a different cursor', () => {
        class MyJuncture2 extends Juncture {
          // eslint-disable-next-line class-methods-use-this
          [jSymbols.createPrivateCursor](hub: CtxHub): Cursor<this> {
            return createCursor(hub.ctx);
          }

          schema = createSchemaDef(() => new Schema(''));
        }
        const juncture2 = Juncture.getInstance(MyJuncture2);

        test('should give access to the new private cursor', () => {
          const ctx2 = new Ctx(juncture2, config);
          expect(isCtxHost(ctx2.privateCursor, ctx2)).toBe(true);
          expect(ctx2.privateCursor).not.toBe(ctx.cursor);
        });
      });
    });
  });
});
