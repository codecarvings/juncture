/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';

describe('jSymbols', () => {
  test('should contain the typeParam1 symbol', () => {
    expect(typeof jSymbols.typeParam1).toBe('symbol');
  });

  test('should contain the defPayload symbol', () => {
    expect(typeof jSymbols.defPayload).toBe('symbol');
  });

  test('should contain the handledValue symbol', () => {
    expect(typeof jSymbols.handledValue).toBe('symbol');
  });

  test('should contain the init symbol', () => {
    expect(typeof jSymbols.init).toBe('symbol');
  });

  test('should contain the propertyAssembler symbol', () => {
    expect(typeof jSymbols.createPropertyAssembler).toBe('symbol');
  });

  test('should contain the createComposer symbol', () => {
    expect(typeof jSymbols.createComposer).toBe('symbol');
  });

  test('should contain the createCtx symbol', () => {
    expect(typeof jSymbols.createCtx).toBe('symbol');
  });

  test('should contain the createCtxHub symbol', () => {
    expect(typeof jSymbols.createCtxHub).toBe('symbol');
  });

  test('should contain the createCursor symbol', () => {
    expect(typeof jSymbols.createCursor).toBe('symbol');
  });

  test('should contain the createPrivateCursor symbol', () => {
    expect(typeof jSymbols.createPrivateCursor).toBe('symbol');
  });

  test('should contain the bitDefault symbol', () => {
    expect(typeof jSymbols.bitDefault).toBe('symbol');
  });
});
