/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchema } from '../../../design/descriptors/schema';
import { JunctureSchema } from '../../../design/schema';
import { createCursor } from '../../../engine/equipment/cursor';
import { Gear, GearLayout, GearMediator } from '../../../engine/gear';
import { getGear, isGearHost } from '../../../engine/gear-host';
import { JMachineGearMediator } from '../../../j-machine';
import { Juncture } from '../../../juncture';

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

const gear1 = new Gear(juncture, layout, gearMediator, machineMediator);
const gear2 = new Gear(juncture, layout, gearMediator, machineMediator);

describe('createCursor', () => {
  test('should create a cursor by passing a Gear', () => {
    const cursor = createCursor(gear1);
    expect(isGearHost(cursor)).toBe(true);
  });

  test('should create a cursor associated with the original Gear', () => {
    const cursor = createCursor(gear1);

    expect(isGearHost(cursor)).toBe(true);
    expect(getGear(cursor)).toBe(gear1);
    expect(getGear(cursor)).not.toBe(gear2);
  });
});
