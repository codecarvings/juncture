/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../construction/access-modifier';

describe('AccessModifier', () => {
  test('should contain the public access type', () => {
    expect(AccessModifier.public).toBe('pub');
  });

  test('should contain the protected access type', () => {
    expect(AccessModifier.protected).toBe('prt');
  });

  test('should contain the private access type', () => {
    expect(AccessModifier.private).toBe('prv');
  });
});
