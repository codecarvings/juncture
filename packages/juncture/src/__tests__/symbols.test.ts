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

  test('should contain the definitionPayload symbol', () => {
    expect(typeof jSymbols.definitionPayload).toBe('symbol');
  });

  test('should contain the handledValue symbol', () => {
    expect(typeof jSymbols.handledValue).toBe('symbol');
  });

  test('should contain the paramSelectorTag symbol', () => {
    expect(typeof jSymbols.paramSelectorTag).toBe('symbol');
  });

  test('should contain the mixReducerTag symbol', () => {
    expect(typeof jSymbols.mixReducerTag).toBe('symbol');
  });

  test('should contain the createDriver symbol', () => {
    expect(typeof jSymbols.createDriver).toBe('symbol');
  });

  test('should contain the createFrame symbol', () => {
    expect(typeof jSymbols.createFrame).toBe('symbol');
  });
});
