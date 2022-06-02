/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';

describe('jSymbols', () => {
  test('should contain the definitionKind symbol', () => {
    expect(typeof jSymbols.definitionKind).toBe('symbol');
  });

  test('should contain the definitionFn symbol', () => {
    expect(typeof jSymbols.definitionFn).toBe('symbol');
  });
});
