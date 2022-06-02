/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../juncture';
import { isDirectSelectorDefinition } from '../kernel/selector';

describe('Juncture', () => {
  test('should be a class', () => {
    expect(typeof Juncture).toBe('function');
    expect(/^class Juncture/.test(Juncture as any)).toBeTruthy();
  });

  describe('instance', () => {
    class MyJuncture extends Juncture {}
    let juncture: MyJuncture;

    beforeEach(() => {
      juncture = new MyJuncture();
    });

    test('should contain a defaultValue selector', () => {
      expect(isDirectSelectorDefinition(juncture.defaultValue)).toBe(true);
    });
  });
});
