/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';

describe('jSymbols', () => {
  test('should contain the payload symbol', () => {
    expect(typeof jSymbols.payload).toBe('symbol');
  });

  test('should contain the init symbol', () => {
    expect(typeof jSymbols.init).toBe('symbol');
  });

  test('should contain the propertyAssembler symbol', () => {
    expect(typeof jSymbols.createPropertyAssembler).toBe('symbol');
  });

  test('should contain the createForger symbol', () => {
    expect(typeof jSymbols.createForger).toBe('symbol');
  });

  test('should contain the createGear symbol', () => {
    expect(typeof jSymbols.createGear).toBe('symbol');
  });

  test('should contain the createCursor symbol', () => {
    expect(typeof jSymbols.createCursor).toBe('symbol');
  });

  test('should contain the createOuterCursor symbol', () => {
    expect(typeof jSymbols.createOuterCursor).toBe('symbol');
  });

  test('should contain the gear symbol', () => {
    expect(typeof jSymbols.gear).toBe('symbol');
  });

  test('should contain the driver symbol', () => {
    expect(typeof jSymbols.driver).toBe('symbol');
  });

  test('should contain the bitDefault symbol', () => {
    expect(typeof jSymbols.bitDefault).toBe('symbol');
  });
});
