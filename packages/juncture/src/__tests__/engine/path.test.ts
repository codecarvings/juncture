/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  isSameOrDescendantPath, Path, pathFragmentToString, pathToString
} from '../../engine/path';

declare function BigInt(x: any): bigint;

describe('pathFragmentToString', () => {
  test('should transform a string fragment', () => {
    expect(pathFragmentToString('str')).toBe('str');
  });

  test('should escape a string fragment', () => {
    expect(pathFragmentToString('\\')).toBe('\\\\');
    expect(pathFragmentToString('\\\\')).toBe('\\\\\\\\');
    expect(pathFragmentToString('a/b/c')).toBe('a\\/b\\/c');
    expect(pathFragmentToString('a\\b\\c')).toBe('a\\\\b\\\\c');
  });

  test('should transform a number', () => {
    expect(pathFragmentToString(21)).toBe('21');
  });

  test('should transform a bigint', () => {
    expect(pathFragmentToString(BigInt(21))).toBe('21');
  });

  test('should transform a symbol with a string description', () => {
    expect(pathFragmentToString(Symbol('\\'))).toBe('\\\\');
    expect(pathFragmentToString(Symbol('\\\\'))).toBe('\\\\\\\\');
    expect(pathFragmentToString(Symbol('a/b/c'))).toBe('a\\/b\\/c');
    expect(pathFragmentToString(Symbol('a\\b\\c'))).toBe('a\\\\b\\\\c');
  });

  test('should transform a symbol with a number description', () => {
    expect(pathFragmentToString(Symbol(3))).toBe('3');
  });

  test('should should escape a symbol with a fragment', () => {
    expect(pathFragmentToString(Symbol('symbol-desc'))).toBe('symbol-desc');
  });

  test('should transform a symbol with a withouht description', () => {
    expect(pathFragmentToString(Symbol(undefined))).toBe('{symbol}');
  });

  test('should transform a boolean', () => {
    expect(pathFragmentToString(true)).toBe('true');
    expect(pathFragmentToString(false)).toBe('false');
  });
});

describe('pathToString', () => {
  const path: Path = ['a', 'b/c', 'd\\e', 4, BigInt(5), Symbol('s'), Symbol('x/y'), true, false];
  const expectedInnerPath = 'a/b\\/c/d\\\\e/4/5/s/x\\/y/true/false';

  test('should format a non absolute path', () => {
    expect(pathToString(path, false)).toBe(`[${expectedInnerPath}]`);
  });
  test('should format an absolute path', () => {
    expect(pathToString(path, true)).toBe(`[/${expectedInnerPath}]`);
  });
  test('should format as absolute path by default', () => {
    expect(pathToString(path)).toBe(`[/${expectedInnerPath}]`);
  });
});

describe('isSameOrDescendantPath', () => {
  describe('when parentPath is empty', () => {
    test('should detect same path', () => {
      expect(isSameOrDescendantPath([], [])).toBe(true);
    });

    test('should detect descendant path', () => {
      expect(isSameOrDescendantPath([], ['a'])).toBe(true);
      expect(isSameOrDescendantPath([], ['a', 'b'])).toBe(true);
    });
  });

  describe('when parentPath is not empty', () => {
    test('should detect same path', () => {
      expect(isSameOrDescendantPath(['a'], ['a'])).toBe(true);
      expect(isSameOrDescendantPath(['a', 'b'], ['a', 'b'])).toBe(true);
    });

    test('should detect descendant path', () => {
      expect(isSameOrDescendantPath(['a'], ['a', 'b'])).toBe(true);
      expect(isSameOrDescendantPath(['a'], ['a', 'b', 'c'])).toBe(true);
      expect(isSameOrDescendantPath(['a', 'b'], ['a', 'b', 'c'])).toBe(true);
      expect(isSameOrDescendantPath(['a', 'b'], ['a', 'b', 'c', 'd'])).toBe(true);
    });

    test('should detect ascendent path', () => {
      expect(isSameOrDescendantPath(['a'], [])).toBe(false);
      expect(isSameOrDescendantPath(['a'], ['b'])).toBe(false);
      expect(isSameOrDescendantPath(['a'], ['b', 'c'])).toBe(false);
      expect(isSameOrDescendantPath(['a', 'b'], [])).toBe(false);
      expect(isSameOrDescendantPath(['a', 'b'], ['a'])).toBe(false);
      expect(isSameOrDescendantPath(['a', 'b'], ['a', 'c'])).toBe(false);
      expect(isSameOrDescendantPath(['a', 'b'], ['c', 'b'])).toBe(false);
    });
  });
});
