/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchema, Schema } from '../../design/descriptors/schema';
import { JunctureSchema } from '../../design/schema';
import { Driver } from '../../driver';
import {
  Gear, GearLayout, GearMediator, GearMountStatus
} from '../../engine/gear';
import { getGear, isGearHost } from '../../engine/gear-host';
import { GearManager } from '../../engine/gear-manager';
import { JMachineGearMediator } from '../../j-machine';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';

describe('Gear', () => {
  interface MyDriver extends Driver {
    schema: Schema<JunctureSchema<string>>;
  }
  let MyMod: Juncture<MyDriver>;
  let driver: MyDriver;

  beforeEach(() => {
    MyMod = class extends Driver {
      schema = createSchema(() => new JunctureSchema(''));
    };
    driver = Juncture.getDriver(MyMod);
  });

  describe('constructor', () => {
    test('should accept a driver, a GearLayout, a GearMediator and a JMachineGearMediator', () => {
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

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const gear = new Gear(driver, layout, gearMediator, machineMediator);
      }).not.toThrow();
    });
  });

  describe('instance', () => {
    let gearManager: GearManager;
    let layout: GearLayout;
    let gearMediator: GearMediator;
    let machineMediator: JMachineGearMediator;
    let gear: Gear;

    beforeEach(() => {
      gearManager = new GearManager();
      layout = {
        parent: null,
        path: [],
        isDivergent: false,
        isUnivocal: true
      };
      gearMediator = {
        getValue: () => 1,
        setValue: () => { }
      };
      machineMediator = {
        gear: {
          enroll: gearManager.enroll,
          createControlled: () => undefined!
        },
        transaction: {
          begin: () => { },
          registerAlteredGear: () => { },
          commit: () => { }
        },
        dispatch: () => {}
      };

      gear = Juncture.createGear(MyMod, layout, gearMediator, machineMediator);
    });

    test('should have a "driver" property containing a reference to the original Driver', () => {
      expect(gear.driver).toBe(driver);
    });

    test('should have a "layout" property containing the same value of the provided layout', () => {
      expect(gear.layout).toBe(layout);
    });

    test('should have a "mountStatus" initially set to "pending"', () => {
      expect(gear.mountStatus).toBe(GearMountStatus.pending);
    });

    describe('outerCursor property', () => {
      test('should give access to a outer cursor associated with the Gear', () => {
        expect(isGearHost(gear.outerCursor)).toBe(true);
        expect(getGear(gear.outerCursor)).toBe(gear);
      });

      test('should invoke the driver[jSymbols.createOuterCursor] factory only once the first time is accessed', () => {
        (driver as any)[jSymbols.createOuterCursor] = jest.fn(driver[jSymbols.createOuterCursor]);
        expect(driver[jSymbols.createOuterCursor]).toBeCalledTimes(0);
        expect(isGearHost(gear.outerCursor)).toBe(true);
        expect(getGear(gear.outerCursor)).toBe(gear);
        expect(driver[jSymbols.createOuterCursor]).toBeCalledTimes(1);
        expect(isGearHost(gear.outerCursor)).toBe(true);
        expect(driver[jSymbols.createOuterCursor]).toBeCalledTimes(1);
      });
    });

    describe('after mount', () => {
      beforeEach(() => {
        gearManager.sync();
      });

      test('should have a "mountStatus" set to "mouted"', () => {
        expect(gear.mountStatus).toBe(GearMountStatus.mounted);
      });
    });

    describe('after unmount', () => {
      beforeEach(() => {
        gearManager.sync();
        gearManager.dismiss(gear);
        gearManager.sync();
      });

      test('should have property "mountStatus" set to "unmounted"', () => {
        expect(gear.mountStatus).toBe(GearMountStatus.unmounted);
      });

      test('should throw error if tryng to access the value property', () => {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const val = gear.value;
        }).toThrow();
      });

      test('should throw error if tryng to access the cursor property', () => {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _ = gear.outerCursor;
        }).toThrow();
      });
    });
  });
});
