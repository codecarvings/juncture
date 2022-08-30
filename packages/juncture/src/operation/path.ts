/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type PathFragment = string | number | bigint | Symbol | boolean;
export interface Path extends ReadonlyArray<PathFragment> { }

function escapePathFragmentString(fragment: string): string {
  return fragment
    .replace(/\\/g, '\\\\') // Escape char
    .replace(/\//g, '\\/');
}

export function pathFragmentToString(fragment: PathFragment): string {
  const fragmentType = typeof fragment;
  switch (fragmentType) {
    case 'number':
    case 'bigint':
      return fragment.toString();
    case 'boolean':
      return fragment ? 'true' : 'false';
    case 'symbol':
      return escapePathFragmentString((fragment as any).description ?? '{symbol}');
    default:
      return escapePathFragmentString(fragment as string);
  }
}

export function pathToString(path: Path, absolute = true): string {
  const result = path.map(fragment => pathFragmentToString(fragment)).join('/');
  return `[${absolute ? '/' : ''}${result}]`;
}

export enum PathComparisonResult {
  disjointed = -2,
  ascendant = -1,
  equal = 0,
  descendant = 1
}

export function comparePaths(path1: Path, path2: Path): PathComparisonResult {
  const path1Len = path1.length;
  const path2Len = path2.length;

  let pathLen: number;
  let finalResult: PathComparisonResult;

  if (path1Len > path2Len) {
    pathLen = path2Len;
    finalResult = PathComparisonResult.ascendant;
  } else if (path2Len > path1Len) {
    pathLen = path1Len;
    finalResult = PathComparisonResult.descendant;
  } else {
    pathLen = path1Len;
    finalResult = PathComparisonResult.equal;
  }

  for (let i = 0; i < pathLen; i += 1) {
    if (path2[i] !== path1[i]) {
      return PathComparisonResult.disjointed;
    }
  }
  return finalResult;
}
