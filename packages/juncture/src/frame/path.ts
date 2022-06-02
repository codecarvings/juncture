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

export function pathFragmentToString(fragment: PathFragment) {
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

export function formatPath(path: Path, absolute = true) {
  const result = path.map(fragment => pathFragmentToString(fragment)).join('/');
  return `[${absolute ? '/' : ''}${result}]`;
}

export function isSameOrDescendantPath(path1: Path, path2: Path) {
  const len1 = path1.length;
  const len2 = path2.length;
  if (len2 < len1) {
    return false;
  }
  for (let i = 0; i < len1; i += 1) {
    if (path2[i] !== path1[i]) {
      return false;
    }
  }
  return true;
}
