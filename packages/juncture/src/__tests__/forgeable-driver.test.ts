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
import { ForgeableDriver } from '../forgeable-driver';
import { Forger } from '../forger';
import { Juncture } from '../juncture';

describe('ForgeableDriver', () => {
  class MyDriver extends ForgeableDriver {
    schema = createSchema(() => new JunctureSchema(''));

    test = 21;

    len = this.FORGE.selector(({ select }) => select().value);
  }

  test('should be a subclass of Driver', () => {
    expect(ForgeableDriver.prototype).toBeInstanceOf(Driver);
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
