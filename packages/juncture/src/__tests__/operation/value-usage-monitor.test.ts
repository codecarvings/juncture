/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { comparePaths, Path, PathComparisonResult } from '../../operation/path';
import { ValueUsageMonitor } from '../../operation/value-usage-monitor';

function arePathArraysEqual(paths1: Path[], paths2: Path[]) {
  if (paths1.length !== paths2.length) {
    return false;
  }
  return paths1.every(path1 => paths2.some(path2 => comparePaths(path1, path2) === PathComparisonResult.equal));
}

// Check the utility function
describe('arePathArraysEqual', () => {
  test('should return true if 2 path arrays are equal', () => {
    expect(arePathArraysEqual([], [])).toBe(true);
    expect(arePathArraysEqual([['a']], [['a']])).toBe(true);
    expect(arePathArraysEqual([['a', 'b']], [['a', 'b']])).toBe(true);
    expect(arePathArraysEqual([['a'], ['b']], [['a'], ['b']])).toBe(true);
    expect(arePathArraysEqual([['a'], ['b']], [['b'], ['a']])).toBe(true);
  });

  test('should return false if 2 path arrays are not equal', () => {
    expect(arePathArraysEqual([['a']], [])).toBe(false);
    expect(arePathArraysEqual([[]], [['a']])).toBe(false);
    expect(arePathArraysEqual([['a']], [['b']])).toBe(false);
    expect(arePathArraysEqual([['a']], [['a'], ['a', 'b']])).toBe(false);
    expect(arePathArraysEqual([['a'], ['a', 'b']], [['a']])).toBe(false);
  });
});

describe('ValueUsageMonitor', () => {
  let monitor: ValueUsageMonitor;

  beforeEach(() => {
    monitor = new ValueUsageMonitor();
  });

  test('should be able to detect the usage of no path', () => {
    monitor.start();
    const result = monitor.stop();
    expect(arePathArraysEqual(result, [])).toBe(true);
  });

  test('should be able to detect the usage of a single path', () => {
    monitor.start();
    monitor.registerValueUsage(['a']);
    const result = monitor.stop();
    expect(arePathArraysEqual(result, [
      ['a']
    ])).toBe(true);
  });

  test('should be able to detect the usage of two disjunted paths', () => {
    monitor.start();
    monitor.registerValueUsage(['a']);
    monitor.registerValueUsage(['b']);
    const result = monitor.stop();
    expect(arePathArraysEqual(result, [
      ['a'],
      ['b']
    ])).toBe(true);
  });

  test('should be able to detect the usage of a descendent path', () => {
    monitor.start();
    monitor.registerValueUsage(['a']);
    monitor.registerValueUsage(['a', 'b']);
    const result = monitor.stop();
    expect(arePathArraysEqual(result, [
      ['a']
    ])).toBe(true);
  });

  test('should be able to detect the usage of a descendent path / 2', () => {
    monitor.start();
    monitor.registerValueUsage(['a']);
    monitor.registerValueUsage(['a', 'b']);
    monitor.registerValueUsage(['a', 'c']);
    const result = monitor.stop();
    expect(arePathArraysEqual(result, [
      ['a']
    ])).toBe(true);
  });

  test('should be able to detect the usage of an ascendent path', () => {
    monitor.start();
    monitor.registerValueUsage(['a', 'b']);
    monitor.registerValueUsage(['a']);
    const result = monitor.stop();
    expect(arePathArraysEqual(result, [
      ['a']
    ])).toBe(true);
  });

  test('should be able to detect the usage of an ascendent path / 2', () => {
    monitor.start();
    monitor.registerValueUsage(['a', 'b']);
    monitor.registerValueUsage(['a', 'c']);
    monitor.registerValueUsage(['a']);
    const result = monitor.stop();
    expect(arePathArraysEqual(result, [
      ['a']
    ])).toBe(true);
  });

  test('should be able to detect the usage divergent paths', () => {
    monitor.start();
    monitor.registerValueUsage(['a', 'b', 'c']);
    monitor.registerValueUsage(['a', 'c', 'd']);
    monitor.registerValueUsage(['a', 'b', 'd']);
    monitor.registerValueUsage(['a', 'b']);
    monitor.registerValueUsage(['a', 'e']);
    const result = monitor.stop();
    expect(arePathArraysEqual(result, [
      ['a', 'b'],
      ['a', 'c', 'd'],
      ['a', 'e']
    ])).toBe(true);
  });
});
