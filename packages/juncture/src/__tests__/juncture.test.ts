/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Ctx, CtxLayout, CtxMediator } from '../context/ctx';
import { isCtxHost } from '../context/ctx-host';
import { DefAccess, DefType, isDef } from '../definition/def';
import { createSchemaDef, Schema } from '../definition/schema';
import { Juncture } from '../juncture';
import { jSymbols } from '../symbols';

describe('Juncture', () => {
  class MyJuncture extends Juncture {
    schema = createSchemaDef(() => new Schema('dv'));
  }

  test('should be a class instantiable without arguments', () => {
    const juncture = new MyJuncture();
    expect(juncture).toBeInstanceOf(Juncture);
  });

  describe('instance', () => {
    let juncture: MyJuncture;

    beforeEach(() => {
      juncture = Juncture.getInstance(MyJuncture);
    });

    describe('[jSymbols.createPropertyAssembler] property', () => {
      test('should be a method', () => {
        expect(typeof juncture[jSymbols.createPropertyAssembler]).toBe('function');
      });

      test('should create new PropetyAssembler for the instance', () => {
        const assembler = juncture[jSymbols.createPropertyAssembler]();
        expect((assembler as any).container).toBe(juncture);
      });
    });

    describe('[jSymbols.init] property', () => {
      test('should be a method', () => {
        expect(typeof juncture[jSymbols.init]).toBe('function');
      });

      test('should invoke the wire method of the property assembler', () => {
        class MyJuncture2 extends MyJuncture {
          [jSymbols.createPropertyAssembler]() {
            const assembler = super[jSymbols.createPropertyAssembler]();
            const fn = jest.fn((assembler.wire));
            (assembler as any).wire = fn;
            return assembler;
          }
        }

        const juncture2 = new MyJuncture2();
        const fn = Juncture.getPropertyAssembler(juncture2).wire as jest.Mock<void, []>;
        const prevInvokcations = fn.mock.calls.length;
        juncture2[jSymbols.init]();
        expect(fn).toHaveBeenCalledTimes(prevInvokcations + 1);
      });
    });

    describe('[jSymbols.createCtx] property', () => {
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

      test('should be a method', () => {
        expect(typeof juncture[jSymbols.createCtx]).toBe('function');
      });

      test('should create a new Ctx for the provided Juncture instance, layout and mediator', () => {
        const ctx = juncture[jSymbols.createCtx](layout, mediator);
        expect(ctx).toBeInstanceOf(Ctx);
        expect(ctx.juncture).toBe(juncture);
        expect(ctx.layout).toBe(layout);
      });

      test('should always return a new Ctx', () => {
        const ctx1 = juncture[jSymbols.createCtx](layout, mediator);
        const ctx2 = juncture[jSymbols.createCtx](layout, mediator);
        expect(ctx2).not.toBe(ctx1);
      });
    });

    describe('[jSymbols.createCursor] property', () => {
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

      test('should be a method', () => {
        expect(typeof juncture[jSymbols.createCursor]).toBe('function');
      });

      test('should create a new Cursor for the provided Ctx', () => {
        const ctx = juncture[jSymbols.createCtx](layout, mediator);
        const cursor = juncture[jSymbols.createCursor](ctx);
        expect(isCtxHost(cursor, ctx)).toBe(true);
      });

      test('should always return a new Cursor', () => {
        const ctx = juncture[jSymbols.createCtx](layout, mediator);
        const cursor1 = juncture[jSymbols.createCursor](ctx);
        const cursor2 = juncture[jSymbols.createCursor](ctx);
        expect(cursor2).not.toBe(cursor1);
      });
    });

    describe('[jSymbols.createPrivateCursor] property', () => {
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

      test('should be a method', () => {
        expect(typeof juncture[jSymbols.createInternalCursor]).toBe('function');
      });

      test('should return the cursor of the ctx', () => {
        const ctx = juncture[jSymbols.createCtx](layout, mediator);
        const cursor = juncture[jSymbols.createInternalCursor](ctx);
        expect(cursor).toBe(ctx.cursor);
      });
    });

    test('should contain the "schema" SchemaDef', () => {
      expect(isDef(juncture.schema)).toBe(true);
      expect(juncture.schema.type).toBe(DefType.schema);
      expect(juncture.schema.access).toBe(DefAccess.public);
    });

    test('should contain a "defaultValue" PubSelectorDef', () => {
      expect(isDef(juncture.defaultValue)).toBe(true);
      expect(juncture.defaultValue.type).toBe(DefType.selector);
      expect(juncture.defaultValue.access).toBe(DefAccess.public);
    });

    test('should contain a "path" PubSelectorDef ', () => {
      expect(isDef(juncture.path)).toBe(true);
      expect(juncture.path.type).toBe(DefType.selector);
      expect(juncture.path.access).toBe(DefAccess.public);
    });

    test('should contain a "isMounted" SelectorDef', () => {
      expect(isDef(juncture.isMounted)).toBe(true);
      expect(juncture.isMounted.type).toBe(DefType.selector);
      expect(juncture.isMounted.access).toBe(DefAccess.public);
    });

    test('should contain a "value" SelectorDef', () => {
      expect(isDef(juncture.value)).toBe(true);
      expect(juncture.value.type).toBe(DefType.selector);
      expect(juncture.value.access).toBe(DefAccess.public);
    });
  });

  describe('static', () => {
    describe('getInstance', () => {
      test('should be a method', () => {
        expect(typeof Juncture.getInstance).toBe('function');
      });

      test('should return an instance of the provided Juncture type', () => {
        const juncture = Juncture.getInstance(MyJuncture);
        expect(juncture).toBeInstanceOf(MyJuncture);
      });

      test('should always return the same instance', () => {
        const juncture1 = Juncture.getInstance(MyJuncture);
        const juncture2 = Juncture.getInstance(MyJuncture);
        expect(juncture2).toBe(juncture1);
      });

      test('should return the instance of a subclass', () => {
        const juncture = Juncture.getInstance(MyJuncture);

        class MyJuncture2 extends MyJuncture { }

        const juncture2A = Juncture.getInstance(MyJuncture2);
        expect(juncture2A).not.toBe(juncture);
        expect(juncture2A).toBeInstanceOf(MyJuncture2);

        const juncture2B = Juncture.getInstance(MyJuncture2);
        expect(juncture2A).toBe(juncture2B);
      });

      test('should invoke the [jSymbols.init] method of the Juncture when the instance is created', () => {
        let totCalls = 0;
        class MyJuncture2 extends MyJuncture {
          [jSymbols.init]() {
            super[jSymbols.init]();
            totCalls += 1;
          }
        }

        Juncture.getInstance(MyJuncture2);
        expect(totCalls).toBe(1);

        Juncture.getInstance(MyJuncture2);
        expect(totCalls).toBe(1);
      });
    });

    describe('getPropertyAssembler', () => {
      test('should be a method', () => {
        expect(typeof Juncture.getPropertyAssembler).toBe('function');
      });

      test('should return the property assembler of the Juncture', () => {
        const juncture = Juncture.getInstance(MyJuncture);
        const assembler = Juncture.getPropertyAssembler(juncture);
        expect((assembler as any).container).toBe(juncture);
      });

      test('should always return the same value', () => {
        const juncture = Juncture.getInstance(MyJuncture);
        const assembler1 = Juncture.getPropertyAssembler(juncture);
        const assembler2 = Juncture.getPropertyAssembler(juncture);
        expect(assembler2).toBe(assembler1);
      });

      test('should invoke the instance method [jSymbols.createPropertyAssembler]', () => {
        let totCalls = 0;
        class MyJuncture2 extends MyJuncture {
          [jSymbols.createPropertyAssembler]() {
            totCalls += 1;
            return super[jSymbols.createPropertyAssembler]();
          }
        }

        const juncture2 = Juncture.getInstance(MyJuncture2);
        expect(totCalls).toBe(1);

        Juncture.getPropertyAssembler(juncture2);
        expect(totCalls).toBe(1);

        Juncture.getPropertyAssembler(juncture2);
        expect(totCalls).toBe(1);
      });
    });

    describe('getSchema', () => {
      test('should be a method', () => {
        expect(typeof Juncture.getSchema).toBe('function');
      });

      describe('when passing a Juncture Type', () => {
        test('should return the schema for the provided Juncture Type', () => {
          const schema = Juncture.getSchema(MyJuncture);
          expect(schema).toBeInstanceOf(Schema);
          expect(schema.defaultValue).toBe('dv');
        });

        test('should always return the same value', () => {
          const schema1 = Juncture.getSchema(MyJuncture);
          const schema2 = Juncture.getSchema(MyJuncture);
          expect(schema2).toBe(schema1);
        });

        test('should invoke the factory contained in the SchemaDef of the "schema" property', () => {
          class MyJuncture2 extends Juncture {
            schema = createSchemaDef(jest.fn(() => new Schema('')));
          }
          const instance = Juncture.getInstance(MyJuncture2);
          const fn = instance.schema[jSymbols.defPayload] as unknown as jest.Mock<Schema<string>, []>;
          expect(fn).toHaveBeenCalledTimes(0);
          Juncture.getSchema(MyJuncture2);
          expect(fn).toHaveBeenCalledTimes(1);
          Juncture.getSchema(MyJuncture2);
          expect(fn).toHaveBeenCalledTimes(1);
        });
      });

      describe('when passing a Juncture instance', () => {
        test('should return the schema for the provided Juncture instance', () => {
          const juncture = Juncture.getInstance(MyJuncture);
          const schema = Juncture.getSchema(juncture);
          expect(schema).toBeInstanceOf(Schema);
          expect(schema.defaultValue).toBe('dv');
        });

        test('should always return the same value', () => {
          const juncture = Juncture.getInstance(MyJuncture);
          const schema1 = Juncture.getSchema(juncture);
          const schema2 = Juncture.getSchema(juncture);
          expect(schema2).toBe(schema1);
        });

        test('should invoke the factory contained in the SchemaDef of the "schema" property', () => {
          class MyJuncture2 extends Juncture {
            schema = createSchemaDef(jest.fn(() => new Schema('')));
          }
          const instance = Juncture.getInstance(MyJuncture2);
          const fn = instance.schema[jSymbols.defPayload] as unknown as jest.Mock<Schema<string>, []>;
          expect(fn).toHaveBeenCalledTimes(0);
          Juncture.getSchema(instance);
          expect(fn).toHaveBeenCalledTimes(1);
          Juncture.getSchema(instance);
          expect(fn).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('createCtx', () => {
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

      test('should be a method', () => {
        expect(typeof Juncture.createCtx).toBe('function');
      });

      test('should create a new Ctx for the provided Juncture type, layout and mediator', () => {
        const ctx = Juncture.createCtx(MyJuncture, layout, mediator);
        expect(ctx).toBeInstanceOf(Ctx);
        expect(ctx.juncture).toBe(Juncture.getInstance(MyJuncture));
        expect(ctx.layout).toBe(layout);
      });

      test('should invoke the instance method [jSymbols.createCtx]', () => {
        const juncture = Juncture.getInstance(MyJuncture);
        const originalFactory = juncture[jSymbols.createCtx].bind(juncture);
        const factory = jest.fn(originalFactory);
        (juncture as any)[jSymbols.createCtx] = factory;

        expect(factory).toHaveBeenCalledTimes(0);
        Juncture.createCtx(MyJuncture, layout, mediator);
        expect(factory).toHaveBeenCalledTimes(1);
        Juncture.createCtx(MyJuncture, layout, mediator);
        expect(factory).toHaveBeenCalledTimes(2);
      });
    });
  });
});
