/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { createSchema } from '../design/descriptors/schema';
import { JunctureSchema } from '../design/schema';
import { Driver } from '../driver';
import { Gear, GearLayout, GearMediator } from '../engine/gear';
import { JMachineGearMediator } from '../j-machine';
import { Juncture } from '../juncture';
import { jSymbols } from '../symbols';

describe('Juncture', () => {
  class MyDriver extends Driver {
    schema = createSchema(() => new JunctureSchema('dv'));
  }

  describe('getDriver', () => {
    test('should be a method', () => {
      expect(typeof Juncture.getDriver).toBe('function');
    });

    test('should return the driver of the provided Juncture', () => {
      const driver = Juncture.getDriver(MyDriver);
      expect(driver).toBeInstanceOf(MyDriver);
    });

    test('should always return the same driver', () => {
      const driver1 = Juncture.getDriver(MyDriver);
      const driver2 = Juncture.getDriver(MyDriver);
      expect(driver2).toBe(driver1);
    });

    test('should return the driver of a subclass', () => {
      const driver = Juncture.getDriver(MyDriver);

      class MyDriver2 extends MyDriver { }

      const driver2A = Juncture.getDriver(MyDriver2);
      expect(driver2A).not.toBe(driver);
      expect(driver2A).toBeInstanceOf(MyDriver2);

      const driver2B = Juncture.getDriver(MyDriver2);
      expect(driver2A).toBe(driver2B);
    });

    test('should invoke the [jSymbols.init] method of the driver when the instance is created', () => {
      let totCalls = 0;
      class MyDriver2 extends MyDriver {
        [jSymbols.init]() {
          super[jSymbols.init]();
          totCalls += 1;
        }
      }

      Juncture.getDriver(MyDriver2);
      expect(totCalls).toBe(1);

      Juncture.getDriver(MyDriver2);
      expect(totCalls).toBe(1);
    });
  });

  describe('getSchema', () => {
    test('should be a method', () => {
      expect(typeof Juncture.getSchema).toBe('function');
    });

    describe('when passing a Juncture', () => {
      test('should return the schema for the provided Juncture', () => {
        const schema = Juncture.getSchema(MyDriver);
        expect(schema).toBeInstanceOf(JunctureSchema);
        expect(schema.defaultValue).toBe('dv');
      });

      test('should always return the same value', () => {
        const schema1 = Juncture.getSchema(MyDriver);
        const schema2 = Juncture.getSchema(MyDriver);
        expect(schema2).toBe(schema1);
      });

      test('should invoke the factory contained in the Schema of the "schema" property', () => {
        class MyDriver2 extends Driver {
          schema = createSchema(jest.fn(() => new JunctureSchema('')));
        }
        const driver2 = Juncture.getDriver(MyDriver2);
        const fn = driver2.schema[jSymbols.payload] as unknown as jest.Mock<JunctureSchema<string>, []>;
        expect(fn).toHaveBeenCalledTimes(0);
        Juncture.getSchema(MyDriver2);
        expect(fn).toHaveBeenCalledTimes(1);
        Juncture.getSchema(MyDriver2);
        expect(fn).toHaveBeenCalledTimes(1);
      });
    });

    describe('when passing a driver', () => {
      test('should return the schema for the provided driver', () => {
        const driver = Juncture.getDriver(MyDriver);
        const schema = Juncture.getSchema(driver);
        expect(schema).toBeInstanceOf(JunctureSchema);
        expect(schema.defaultValue).toBe('dv');
      });

      test('should always return the same value', () => {
        const driver = Juncture.getDriver(MyDriver);
        const schema1 = Juncture.getSchema(driver);
        const schema2 = Juncture.getSchema(driver);
        expect(schema2).toBe(schema1);
      });

      test('should invoke the factory contained in the Schema of the "schema" property', () => {
        class MyDriver2 extends Driver {
          schema = createSchema(jest.fn(() => new JunctureSchema('')));
        }
        const driver2 = Juncture.getDriver(MyDriver2);
        const fn = driver2.schema[jSymbols.payload] as unknown as jest.Mock<JunctureSchema<string>, []>;
        expect(fn).toHaveBeenCalledTimes(0);
        Juncture.getSchema(driver2);
        expect(fn).toHaveBeenCalledTimes(1);
        Juncture.getSchema(driver2);
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

    test('should create a new Gear for the provided Juncture, layout and mediators', () => {
      const gear = Juncture.createGear(MyDriver, layout, gearMediator, machineMediator);
      expect(gear).toBeInstanceOf(Gear);
      expect(gear.driver).toBe(Juncture.getDriver(MyDriver));
      expect(gear.layout).toBe(layout);
    });

    test('should invoke the instance method [jSymbols.createGear]', () => {
      const driver = Juncture.getDriver(MyDriver);
      const originalFactory = driver[jSymbols.createGear].bind(driver);
      const factory = jest.fn(originalFactory);
      (driver as any)[jSymbols.createGear] = factory;

      expect(factory).toHaveBeenCalledTimes(0);
      Juncture.createGear(MyDriver, layout, gearMediator, machineMediator);
      expect(factory).toHaveBeenCalledTimes(1);
      Juncture.createGear(MyDriver, layout, gearMediator, machineMediator);
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });
});
