/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchema } from '../../design/descriptors/schema';
import { JunctureSchema } from '../../design/schema';
import { Gear, GearLayout, GearMediator } from '../../engine/gear';
import { addGearLink, getGear, isGearHost } from '../../engine/gear-host';
import { JMachineGearMediator } from '../../j-machine';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';

class MyJuncture extends Juncture {
  schema = createSchema(() => new JunctureSchema(''));
}
const juncture = Juncture.getInstance(MyJuncture);
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

const gear1 = new Gear(juncture, layout, gearMediator, machineMediator);
const gear2 = new Gear(juncture, layout, gearMediator, machineMediator);

describe('addGearLink', () => {
  test('should add a property [jSymbols.gear] containing a refernce to the provided Gear', () => {
    const host: any = {};
    addGearLink(host, gear1);
    expect(host[jSymbols.gear]).toBe(gear1);
  });

  test('should return the provided container', () => {
    const host = {};
    const host2 = addGearLink(host, gear1);
    expect(host2).toBe(host);
  });
});

describe('getGear', () => {
  test('should return the Gear associated to the GearHost', () => {
    const host1 = addGearLink({}, gear1);
    const host2 = addGearLink({}, gear2);

    expect(getGear(host1)).toBe(gear1);
    expect(getGear(host2)).toBe(gear2);
  });
});

describe('isGearHost', () => {
  test('should return true if object is a GearHost', () => {
    const host = addGearLink({}, gear1);
    expect(isGearHost(host)).toBe(true);
  });
  test('should return false if object is not a GearHost', () => {
    expect(isGearHost('a-string')).toBe(false);
    expect(isGearHost(1)).toBe(false);
    expect(isGearHost(true)).toBe(false);
    expect(isGearHost(undefined)).toBe(false);
    expect(isGearHost(null)).toBe(false);
  });
});
