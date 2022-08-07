/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Ctx, CtxLayout, CtxMediator } from '../../context/ctx';
import { isCtxHost } from '../../context/ctx-host';
import { createSchemaDef, Schema, SchemaDef } from '../../definition/schema';
import { Juncture, JunctureType } from '../../juncture';
import { jSymbols } from '../../symbols';

describe('Ctx', () => {
  interface MyJuncture extends Juncture {
    schema: SchemaDef<Schema<string>>;
  }
  let MyJunctureType: JunctureType<MyJuncture>;
  let juncture: MyJuncture;

  beforeEach(() => {
    MyJunctureType = class extends Juncture {
      schema = createSchemaDef(() => new Schema(''));
    };
    juncture = Juncture.getInstance(MyJunctureType);
  });

  describe('constructor', () => {
    test('should accept a juncture, a CtxLayout and CtxMediator object', () => {
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

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const ctx = new Ctx(juncture, layout, mediator);
      }).not.toThrow();
    });
  });

  describe('instance', () => {
    let unmount: () => void = undefined!;
    let layout: CtxLayout;
    let mediator: CtxMediator;
    let ctx: Ctx;

    beforeEach(() => {
      layout = {
        parent: null,
        path: [],
        isDivergent: false,
        isUnivocal: true
      };
      mediator = {
        enroll: um => { unmount = um; },
        getValue: () => 1,
        setValue: () => { },
        dispatch: () => {}
      };

      ctx = new Ctx(juncture, layout, mediator);
    });

    test('should have a "juncture" property containing a reference to the original Juncture', () => {
      expect(ctx.juncture).toBe(juncture);
    });

    test('should have a "layout" property containing the same value of the provided layout', () => {
      expect(ctx.layout).toBe(layout);
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

    describe('after unmount has been ivoked', () => {
      test('should have property "isMounted" set to false', () => {
        expect(ctx.isMounted).toBe(true);
        unmount();
        expect(ctx.isMounted).toBe(false);
      });

      test('should throw error if tryng to access the value property', () => {
        expect(ctx.value).toBe(1);
        unmount();
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const val = ctx.value;
        }).toThrow();
      });

      test('should throw error if tryng to access the cursor property', () => {
        expect(isCtxHost(ctx.cursor, ctx)).toBe(true);
        unmount();
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _ = ctx.cursor;
        }).toThrow();
      });
    });
  });
});
