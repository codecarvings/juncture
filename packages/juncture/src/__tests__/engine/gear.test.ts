/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchema, Schema } from '../../construction/descriptors/schema';
import { JunctureSchema } from '../../construction/schema';
import { Gear, GearLayout, GearMediator } from '../../engine/gear';
import { getGear, isGearHost } from '../../engine/gear-host';
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
    test('should accept a juncture, a GearLayout and GearMediator object', () => {
      const layout: GearLayout = {
        parent: null,
        path: [],
        isDivergent: false,
        isUnivocal: true
      };
      const mediator: GearMediator = {
        enroll: () => { },
        getValue: () => undefined,
        setValue: () => { },
        dispatch: () => {}
      };

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const gear = new Gear(juncture, layout, mediator);
      }).not.toThrow();
    });
  });

  describe('instance', () => {
    let unmount: () => void = undefined!;
    let layout: GearLayout;
    let mediator: GearMediator;
    let gear: Gear;

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

      gear = new Gear(juncture, layout, mediator);
    });

    test('should have a "juncture" property containing a reference to the original Juncture', () => {
      expect(gear.juncture).toBe(juncture);
    });

    test('should have a "layout" property containing the same value of the provided layout', () => {
      expect(gear.layout).toBe(layout);
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

    describe('after unmount has been ivoked', () => {
      test('should have property "isMounted" set to false', () => {
        expect(gear.isMounted).toBe(true);
        unmount();
        expect(gear.isMounted).toBe(false);
      });

      test('should throw error if tryng to access the value property', () => {
        expect(gear.value).toBe(1);
        unmount();
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const val = gear.value;
        }).toThrow();
      });

      test('should throw error if tryng to access the cursor property', () => {
        expect(isGearHost(gear.cursor)).toBe(true);
        unmount();
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _ = gear.cursor;
        }).toThrow();
      });
    });
  });
});
