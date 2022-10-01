/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { BaseDriver } from '../base-driver';
import { createSchema } from '../design/descriptors/schema';
import { ForgeableDriver } from '../forgeable-driver';
import { Forger } from '../forger';
import { Juncture } from '../juncture';
import { JunctureSchema } from '../schema';

describe('ForgeableDriver', () => {
  class MyDriver extends ForgeableDriver {
    schema = createSchema(() => new JunctureSchema(''));

    test = 21;

    'selector.len' = this.FORGE.selector(
      ({ select }): number => select().value.length
    );
  }

  test('should be a subclass of BaseDriver', () => {
    expect(ForgeableDriver.prototype).toBeInstanceOf(BaseDriver);
  });

  test('should be a class instantiable without arguments', () => {
    const driver = new MyDriver();
    expect(driver).toBeInstanceOf(ForgeableDriver);
  });

  describe('instance', () => {
    let driver: MyDriver;

    beforeEach(() => {
      driver = Juncture.getDriver(MyDriver);
    });

    test('should contain the FORGE propterty that give access to the forger', () => {
      expect((driver as any).FORGE).toBeInstanceOf(Forger);
    });
  });
});
