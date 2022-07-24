/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ComposableJuncture } from '../composable-juncture';
import { Composer } from '../composer';
import { createSchemaDef, Schema } from '../definition/schema';
import { Juncture } from '../juncture';

describe('ComposableJuncture', () => {
  class MyJuncture extends ComposableJuncture {
    schema = createSchemaDef(() => new Schema(''));

    test = 21;

    len = this.DEF.selector(({ select }) => select().value);
  }

  test('should be a subclass of Juncture', () => {
    expect(ComposableJuncture.prototype).toBeInstanceOf(Juncture);
  });

  test('should be a class instantiable without arguments', () => {
    const juncture = new MyJuncture();
    expect(juncture).toBeInstanceOf(ComposableJuncture);
  });

  describe('instance', () => {
    let juncture: MyJuncture;

    beforeEach(() => {
      juncture = Juncture.getInstance(MyJuncture);
    });

    test('should contain the DEF composer', () => {
      expect((juncture as any).DEF).toBeInstanceOf(Composer);
    });
  });
});
