/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PropertyAssembler } from '../../fabric/property-assembler';

describe('PropertyAssembler', () => {
  describe('constructor', () => {
    test('should accept the container object as the only argument', () => {
      const container: any = {};
      const assembler = new PropertyAssembler(container);
      expect(assembler).toBeInstanceOf(PropertyAssembler);
    });
  });

  describe('registerStaticProperty method', () => {
    test('should return an unique symbol', () => {
      const container: any = {};
      const assembler = new PropertyAssembler(container);
      const value1 = { value: 'test1' };
      const s1 = assembler.registerStaticProperty(value1);
      container.s1 = s1;
      expect(typeof s1).toBe('symbol');
      const s2 = assembler.registerStaticProperty(value1);
      container.s2 = s2;
      expect(typeof s2).toBe('symbol');
      expect(s2).not.toBe(s1);
    });

    test('should automatically invoke the wire method', () => {
      const container: any = {};
      const assembler = new PropertyAssembler(container);
      const originalWire = assembler.wire.bind(assembler);
      const wire = jest.fn(originalWire);
      (assembler as any).wire = wire;

      const value1 = { value: 'test1' };
      container.s1 = assembler.registerStaticProperty(value1);
      expect(wire).toHaveBeenCalledTimes(1);
    });
  });

  describe('registerDynamicProperty method', () => {
    test('should return an unique symbol', () => {
      const container: any = {};
      const assembler = new PropertyAssembler(container);
      const factory1 = () => null;
      const s1 = assembler.registerDynamicProperty(factory1);
      container.s1 = s1;
      expect(typeof s1).toBe('symbol');
      const s2 = assembler.registerDynamicProperty(factory1);
      container.s2 = s2;
      expect(typeof s2).toBe('symbol');
      expect(s2).not.toBe(s1);
    });

    test('should not invoke the provided factory', () => {
      const container: any = {};
      const assembler = new PropertyAssembler(container);
      const factory1 = jest.fn(() => null);
      container.s1 = assembler.registerDynamicProperty(factory1);
      expect(factory1).not.toHaveBeenCalled();
    });

    test('should automatically invoke the wire method', () => {
      const container: any = {};
      const assembler = new PropertyAssembler(container);
      const originalWire = assembler.wire.bind(assembler);
      const wire = jest.fn(originalWire);
      (assembler as any).wire = wire;

      const factory1 = () => null;
      container.s1 = assembler.registerDynamicProperty(factory1);
      expect(wire).toHaveBeenCalledTimes(1);
    });
  });

  describe('wire method', () => {
    test('should set the value of a property registerd via registerStaticProperty', () => {
      const container: any = {};
      const assembler = new PropertyAssembler(container);
      const value1 = { value: 'test1' };
      container.s1 = assembler.registerStaticProperty(value1);
      expect(typeof container.s1).toBe('symbol');

      assembler.wire();

      expect(container.s1).toBe(value1);
    });

    test('should invoke the factory registerd via registerDynamicProperty', () => {
      const container: any = {};
      const assembler = new PropertyAssembler(container);
      const factory1 = jest.fn(() => null);
      container.s1 = assembler.registerDynamicProperty(factory1);
      expect(factory1).toHaveBeenCalledTimes(0);
      assembler.wire();
      expect(factory1).toHaveBeenCalledTimes(1);
    });

    describe('when invoke the factory registered by registerDynamicProperty', () => {
      test('should provide the key as first argument', () => {
        const container: any = {};
        const assembler = new PropertyAssembler(container);
        const originalWire = assembler.wire.bind(assembler);
        const wire = jest.fn(originalWire);
        (assembler as any).wire = wire;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const factory1 = jest.fn((key: string) => null);
        container.s1 = assembler.registerDynamicProperty(factory1);
        assembler.wire();
        expect(factory1.mock.lastCall[0]).toBe('s1');
      });

      describe('when no parent is present', () => {
        test('should provide undefined as parent via the second argument', () => {
          const container: any = {};
          const assembler = new PropertyAssembler(container);
          const originalWire = assembler.wire.bind(assembler);
          const wire = jest.fn(originalWire);
          (assembler as any).wire = wire;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const factory1 = jest.fn((key: string, parent: any) => null);
          container.s1 = assembler.registerDynamicProperty(factory1);
          assembler.wire();
          expect(factory1.mock.lastCall[1]).toBe(undefined);
        });
      });

      describe('when a parent has been previously registered via registerStaticProperty', () => {
        test('should provide the parent value via the second argument', () => {
          const container: any = {};
          const assembler = new PropertyAssembler(container);
          const originalWire = assembler.wire.bind(assembler);
          const wire = jest.fn(originalWire);
          (assembler as any).wire = wire;

          const value1 = { value: 'test1' };
          container.s1 = assembler.registerStaticProperty(value1);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const factory1 = jest.fn((key: string, parent: any) => null);
          container.s1 = assembler.registerDynamicProperty(factory1);
          assembler.wire();
          expect(factory1.mock.lastCall[1]).toBe(value1);
        });
      });

      describe('when a parent has been previously registered with registerDynamicProperty', () => {
        test('should provide the parent value via the second argument', () => {
          const container: any = {};
          const assembler = new PropertyAssembler(container);
          const originalWire = assembler.wire.bind(assembler);
          const wire = jest.fn(originalWire);
          (assembler as any).wire = wire;

          const value1 = { value: 'test1' };
          container.s1 = assembler.registerDynamicProperty(() => value1);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const factory1 = jest.fn((key: string, parent: any) => null);
          container.s1 = assembler.registerDynamicProperty(factory1);
          assembler.wire();
          expect(factory1.mock.lastCall[1]).toBe(value1);
        });
      });

      test('should provide the container as third argument', () => {
        const container: any = {};
        const assembler = new PropertyAssembler(container);
        const originalWire = assembler.wire.bind(assembler);
        const wire = jest.fn(originalWire);
        (assembler as any).wire = wire;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const factory1 = jest.fn((key: string, parent: any, container2: any) => null);
        container.s1 = assembler.registerDynamicProperty(factory1);
        assembler.wire();
        expect(factory1.mock.lastCall[2]).toBe(container);
      });
    });

    test('should set the value of a property registerd via registerDynamicProperty', () => {
      const container: any = {};
      const assembler = new PropertyAssembler(container);
      const value1 = { value: 'test1' };
      container.s1 = assembler.registerDynamicProperty(() => value1);
      expect(typeof container.s1).toBe('symbol');

      assembler.wire();

      expect(container.s1).toBe(value1);
    });

    describe('when no pending property is present', () => {
      test('should not throw error', () => {
        const container1: any = {};
        const assembler1 = new PropertyAssembler(container1);
        expect(() => {
          assembler1.wire();
        }).not.toThrow();

        const container2: any = {};
        const assembler2 = new PropertyAssembler(container2);
        expect(() => {
          const value1 = { value: 'test1' };
          container2.s1 = assembler2.registerStaticProperty(value1);
          assembler2.wire();
          assembler2.wire();
        }).not.toThrow();
      });
    });
  });
});
