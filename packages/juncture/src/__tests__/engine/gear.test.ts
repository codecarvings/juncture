/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchema, Schema } from '../../design/descriptors/schema';
import { JunctureSchema } from '../../design/schema';
import {
    Gear, GearLayout, GearMediator, GearMountStatus
} from '../../engine/gear';
import { getGear, isGearHost } from '../../engine/gear-host';
import { GearManager } from '../../engine/gear-manager';
import { JMachineGearMediator } from '../../j-machine';
import { Juncture, JunctureType } from '../../juncture';
import { jSymbols } from '../../symbols';

describe('Gear', () => {
  interface MyJuncture extends Juncture {
    schema: Schema<JunctureSchema<string>>;
  }
  let MyJunctureType: JunctureType<MyJuncture>;
  let juncture: MyJuncture;

  beforeEach(() => {
    MyJunctureType = class extends Juncture {
      schema = createSchema(() => new JunctureSchema(''));
    };
    juncture = Juncture.getInstance(MyJunctureType);
  });

  describe('constructor', () => {
    test('should accept a juncture, a GearLayout, a GearMediator and a JMachineGearMediator', () => {
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
        enrollGear: () => { },
        createControlledGear: () => undefined!,
        dispatch: () => {}
      };

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const gear = new Gear(juncture, layout, gearMediator, machineMediator);
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
        enrollGear: gearManager.enrollGear,
        createControlledGear: () => undefined!,
        dispatch: () => {}
      };

      gear = Juncture.createGear(MyJunctureType, layout, gearMediator, machineMediator);
    });

    test('should have a "juncture" property containing a reference to the original Juncture', () => {
      expect(gear.juncture).toBe(juncture);
    });

    test('should have a "layout" property containing the same value of the provided layout', () => {
      expect(gear.layout).toBe(layout);
    });

    test('should have a "mountStatus" initially set to "pending"', () => {
      expect(gear.mountStatus).toBe(GearMountStatus.pending);
    });

    describe('cursor property', () => {
      test('should give access to a cursor associated with the Gear', () => {
        expect(isGearHost(gear.cursor)).toBe(true);
        expect(getGear(gear.cursor)).toBe(gear);
      });

      test('should invoke the juncture[jSymbols.createCursor] factory only once the first time is accessed', () => {
        (juncture as any)[jSymbols.createCursor] = jest.fn(juncture[jSymbols.createCursor]);
        expect(juncture[jSymbols.createCursor]).toBeCalledTimes(0);
        expect(isGearHost(gear.cursor)).toBe(true);
        expect(getGear(gear.cursor)).toBe(gear);
        expect(juncture[jSymbols.createCursor]).toBeCalledTimes(1);
        expect(isGearHost(gear.cursor)).toBe(true);
        expect(juncture[jSymbols.createCursor]).toBeCalledTimes(1);
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
        gearManager.dismissGear(gear);
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
          const _ = gear.cursor;
        }).toThrow();
      });
    });
  });
});
