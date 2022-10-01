/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { junctureSymbols } from '../../juncture-symbols';
import { Initializable, initialize, isInitializable } from '../../utilities/initializable';

describe('isInitializable', () => {
  test('should return true if the provided value is a initializable object', () => {
    const obj: Initializable = {
      [junctureSymbols.init]() { }
    };
    expect(isInitializable(obj)).toBe(true);
  });

  test('should return false if the provided value is not an initializable object', () => {
    expect(isInitializable(undefined)).toBe(false);
    expect(isInitializable(false)).toBe(false);
    expect(isInitializable('')).toBe(false);
    expect(isInitializable({ })).toBe(false);
  });
});

describe('initialize', () => {
  test('should invoke the [jSymbols.init] method of the provided object', () => {
    const initFn = jest.fn();
    const obj: Initializable = {
      [junctureSymbols.init]: initFn
    };
    initialize(obj);
    expect(initFn).toHaveBeenCalledTimes(1);
    initialize(obj);
    expect(initFn).toHaveBeenCalledTimes(2);
  });
});