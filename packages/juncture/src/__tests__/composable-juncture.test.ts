/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchemaDef, Schema } from '../definition/schema';
import { ForgeableJuncture } from '../forgeable-juncture';
import { Forger } from '../forger';
import { Juncture } from '../juncture';

describe('ForgeableJuncture', () => {
  class MyJuncture extends ForgeableJuncture {
    schema = createSchemaDef(() => new Schema(''));

    test = 21;

    len = this.FORGE.selector(({ select }) => select().value);
  }

  test('should be a subclass of Juncture', () => {
    expect(ForgeableJuncture.prototype).toBeInstanceOf(Juncture);
  });

  test('should be a class instantiable without arguments', () => {
    const juncture = new MyJuncture();
    expect(juncture).toBeInstanceOf(ForgeableJuncture);
  });

  describe('instance', () => {
    let juncture: MyJuncture;

    beforeEach(() => {
      juncture = Juncture.getInstance(MyJuncture);
    });

    test('should contain the FORGE propterty that give access to the forger', () => {
      expect((juncture as any).FORGE).toBeInstanceOf(Forger);
    });
  });
});
