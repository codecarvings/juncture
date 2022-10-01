/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { junctureSymbols } from '../juncture-symbols';

describe('junctureSymbols', () => {
  test('should contain the payload symbol', () => {
    expect(typeof junctureSymbols.payload).toBe('symbol');
  });

  test('should contain the init symbol', () => {
    expect(typeof junctureSymbols.init).toBe('symbol');
  });

  test('should contain the propertyAssembler symbol', () => {
    expect(typeof junctureSymbols.createPropertyAssembler).toBe('symbol');
  });

  test('should contain the createForger symbol', () => {
    expect(typeof junctureSymbols.createForger).toBe('symbol');
  });

  test('should contain the createSetup symbol', () => {
    expect(typeof junctureSymbols.createSetup).toBe('symbol');
  });

  test('should contain the createRealm symbol', () => {
    expect(typeof junctureSymbols.createRealm).toBe('symbol');
  });

  test('should contain the createCursor symbol', () => {
    expect(typeof junctureSymbols.createCursor).toBe('symbol');
  });

  test('should contain the createXpCursor symbol', () => {
    expect(typeof junctureSymbols.createXpCursor).toBe('symbol');
  });

  test('should contain the realm symbol', () => {
    expect(typeof junctureSymbols.realm).toBe('symbol');
  });

  test('should contain the driver symbol', () => {
    expect(typeof junctureSymbols.driver).toBe('symbol');
  });

  test('should contain the persistent symbol', () => {
    expect(typeof junctureSymbols.persistent).toBe('symbol');
  });

  test('should contain the bitDefault symbol', () => {
    expect(typeof junctureSymbols.bitDefault).toBe('symbol');
  });
});
