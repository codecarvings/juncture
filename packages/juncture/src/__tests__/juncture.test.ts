/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { AccessModifier } from '../design/access-modifier';
import { isDescriptor } from '../design/descriptor';
import { DescriptorType } from '../design/descriptor-type';
import { createSchema } from '../design/descriptors/schema';
import { JunctureSchema } from '../design/schema';
import { Gear, GearLayout, GearMediator } from '../engine/gear';
import { getGear, isGearHost } from '../engine/gear-host';
import { JMachineGearMediator } from '../j-machine';
import { Juncture } from '../juncture';
import { jSymbols } from '../symbols';

describe('Juncture', () => {
  class MyJuncture extends Juncture {
    schema = createSchema(() => new JunctureSchema('dv'));
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

    describe('[jSymbols.createGear] property', () => {
      const layout: GearLayout = {
        parent: null,
        path: [],
        isDivergent: false,
        isUnivocal: true
      };
      const gearMediator: GearMediator = {
        getValue: () => undefined,
        setValue: () => { }
      };
      const machineMediator: JMachineGearMediator = {
        gear: {
          enroll: () => { },
          createControlled: () => undefined!
        },
        transaction: {
          begin: () => { },
          registerAlteredGear: () => { },
          commit: () => { }
        },
        dispatch: () => {}
      };

      test('should be a method', () => {
        expect(typeof juncture[jSymbols.createGear]).toBe('function');
      });

      test('should create a new Gear for the provided Juncture instance, layout and mediators', () => {
        const gear = juncture[jSymbols.createGear](layout, gearMediator, machineMediator);
        expect(gear).toBeInstanceOf(Gear);
        expect(gear.juncture).toBe(juncture);
        expect(gear.layout).toBe(layout);
      });

      test('should always return a new Gear', () => {
        const gear1 = juncture[jSymbols.createGear](layout, gearMediator, machineMediator);
        const gear2 = juncture[jSymbols.createGear](layout, gearMediator, machineMediator);
        expect(gear2).not.toBe(gear1);
      });
    });

    describe('[jSymbols.createCursor] property', () => {
      const layout: GearLayout = {
        parent: null,
        path: [],
        isDivergent: false,
        isUnivocal: true
      };
      const gearMediator: GearMediator = {
        getValue: () => undefined,
        setValue: () => { }
      };
      const machineMediator: JMachineGearMediator = {
        gear: {
          enroll: () => { },
          createControlled: () => undefined!
        },
        transaction: {
          begin: () => { },
          registerAlteredGear: () => { },
          commit: () => { }
        },
        dispatch: () => {}
      };

      test('should be a method', () => {
        expect(typeof juncture[jSymbols.createCursor]).toBe('function');
      });

      test('should create a new Cursor for the provided Gear', () => {
        const gear = juncture[jSymbols.createGear](layout, gearMediator, machineMediator);
        const cursor = juncture[jSymbols.createCursor](gear);
        expect(isGearHost(cursor)).toBe(true);
        expect(getGear(cursor)).toBe(gear);
      });

      test('should always return a new Cursor', () => {
        const gear = juncture[jSymbols.createGear](layout, gearMediator, machineMediator);
        const cursor1 = juncture[jSymbols.createCursor](gear);
        const cursor2 = juncture[jSymbols.createCursor](gear);
        expect(cursor2).not.toBe(cursor1);
      });
    });

    describe('[jSymbols.createPrivateCursor] property', () => {
      const layout: GearLayout = {
        parent: null,
        path: [],
        isDivergent: false,
        isUnivocal: true
      };
      const gearMediator: GearMediator = {
        getValue: () => undefined,
        setValue: () => { }
      };
      const machineMediator: JMachineGearMediator = {
        gear: {
          enroll: () => { },
          createControlled: () => undefined!
        },
        transaction: {
          begin: () => { },
          registerAlteredGear: () => { },
          commit: () => { }
        },
        dispatch: () => {}
      };

      test('should be a method', () => {
        expect(typeof juncture[jSymbols.createInternalCursor]).toBe('function');
      });

      test('should return the cursor of the Gear', () => {
        const gear = juncture[jSymbols.createGear](layout, gearMediator, machineMediator);
        const cursor = juncture[jSymbols.createInternalCursor](gear);
        expect(cursor).toBe(gear.cursor);
      });
    });

    test('should contain the "schema" Schema', () => {
      expect(isDescriptor(juncture.schema)).toBe(true);
      expect(juncture.schema.type).toBe(DescriptorType.schema);
      expect(juncture.schema.access).toBe(AccessModifier.public);
    });

    test('should contain a "defaultValue" PubSelector', () => {
      expect(isDescriptor(juncture.defaultValue)).toBe(true);
      expect(juncture.defaultValue.type).toBe(DescriptorType.selector);
      expect(juncture.defaultValue.access).toBe(AccessModifier.public);
    });

    test('should contain a "path" PubSelector', () => {
      expect(isDescriptor(juncture.path)).toBe(true);
      expect(juncture.path.type).toBe(DescriptorType.selector);
      expect(juncture.path.access).toBe(AccessModifier.public);
    });

    test('should contain a "isMounted" PubSelector', () => {
      expect(isDescriptor(juncture.isMounted)).toBe(true);
      expect(juncture.isMounted.type).toBe(DescriptorType.selector);
      expect(juncture.isMounted.access).toBe(AccessModifier.public);
    });

    test('should contain a "value" Selector', () => {
      expect(isDescriptor(juncture.value)).toBe(true);
      expect(juncture.value.type).toBe(DescriptorType.selector);
      expect(juncture.value.access).toBe(AccessModifier.public);
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

      describe('when passing a Juncture Ctor', () => {
        test('should return the schema for the provided Juncture Ctor', () => {
          const schema = Juncture.getSchema(MyJuncture);
          expect(schema).toBeInstanceOf(JunctureSchema);
          expect(schema.defaultValue).toBe('dv');
        });

        test('should always return the same value', () => {
          const schema1 = Juncture.getSchema(MyJuncture);
          const schema2 = Juncture.getSchema(MyJuncture);
          expect(schema2).toBe(schema1);
        });

        test('should invoke the factory contained in the Schema of the "schema" property', () => {
          class MyJuncture2 extends Juncture {
            schema = createSchema(jest.fn(() => new JunctureSchema('')));
          }
          const instance = Juncture.getInstance(MyJuncture2);
          const fn = instance.schema[jSymbols.payload] as unknown as jest.Mock<JunctureSchema<string>, []>;
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
          expect(schema).toBeInstanceOf(JunctureSchema);
          expect(schema.defaultValue).toBe('dv');
        });

        test('should always return the same value', () => {
          const juncture = Juncture.getInstance(MyJuncture);
          const schema1 = Juncture.getSchema(juncture);
          const schema2 = Juncture.getSchema(juncture);
          expect(schema2).toBe(schema1);
        });

        test('should invoke the factory contained in the Schema of the "schema" property', () => {
          class MyJuncture2 extends Juncture {
            schema = createSchema(jest.fn(() => new JunctureSchema('')));
          }
          const instance = Juncture.getInstance(MyJuncture2);
          const fn = instance.schema[jSymbols.payload] as unknown as jest.Mock<JunctureSchema<string>, []>;
          expect(fn).toHaveBeenCalledTimes(0);
          Juncture.getSchema(instance);
          expect(fn).toHaveBeenCalledTimes(1);
          Juncture.getSchema(instance);
          expect(fn).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('createGear', () => {
      const layout: GearLayout = {
        parent: null,
        path: [],
        isDivergent: false,
        isUnivocal: true
      };
      const gearMediator: GearMediator = {
        getValue: () => undefined,
        setValue: () => { }
      };
      const machineMediator: JMachineGearMediator = {
        gear: {
          enroll: () => { },
          createControlled: () => undefined!
        },
        transaction: {
          begin: () => { },
          registerAlteredGear: () => { },
          commit: () => { }
        },
        dispatch: () => {}
      };

      test('should be a method', () => {
        expect(typeof Juncture.createGear).toBe('function');
      });

      test('should create a new Gear for the provided Juncture type, layout and mediators', () => {
        const gear = Juncture.createGear(MyJuncture, layout, gearMediator, machineMediator);
        expect(gear).toBeInstanceOf(Gear);
        expect(gear.juncture).toBe(Juncture.getInstance(MyJuncture));
        expect(gear.layout).toBe(layout);
      });

      test('should invoke the instance method [jSymbols.createGear]', () => {
        const juncture = Juncture.getInstance(MyJuncture);
        const originalFactory = juncture[jSymbols.createGear].bind(juncture);
        const factory = jest.fn(originalFactory);
        (juncture as any)[jSymbols.createGear] = factory;

        expect(factory).toHaveBeenCalledTimes(0);
        Juncture.createGear(MyJuncture, layout, gearMediator, machineMediator);
        expect(factory).toHaveBeenCalledTimes(1);
        Juncture.createGear(MyJuncture, layout, gearMediator, machineMediator);
        expect(factory).toHaveBeenCalledTimes(2);
      });
    });
  });
});
