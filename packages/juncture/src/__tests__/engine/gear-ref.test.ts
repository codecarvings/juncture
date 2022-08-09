/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchema } from '../../construction/descriptors/schema';
import { JunctureSchema } from '../../construction/schema';
import { Gear, GearLayout, GearMediator } from '../../engine/gear';
import { getGear, isGearHost } from '../../engine/gear-host';
import { createGearRef } from '../../engine/gear-ref';
import { Juncture } from '../../juncture';

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
const mediator: GearMediator = {
  enroll: () => { },
  getValue: () => undefined,
  setValue: () => { },
  dispatch: () => {}
};
const gear1 = new Gear(juncture, layout, mediator);
const gear2 = new Gear(juncture, layout, mediator);

describe('createGearRef', () => {
  test('should create a GearRef by passing a Gear', () => {
    const ref = createGearRef(gear1);
    expect(isGearHost(ref)).toBe(true);
  });

  test('should create a GearRef associated with the original Gear', () => {
    const ref = createGearRef(gear1);

    expect(isGearHost(ref)).toBe(true);
    expect(getGear(ref)).toBe(gear1);
    expect(getGear(ref)).not.toBe(gear2);
  });
});
