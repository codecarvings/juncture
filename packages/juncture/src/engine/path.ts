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

export function isSameOrDescendantPath(parent: Path, child: Path): boolean {
  const parentLen = parent.length;
  const childLen = child.length;
  if (childLen < parentLen) {
    return false;
  }
  for (let i = 0; i < parentLen; i += 1) {
    if (child[i] !== parent[i]) {
      return false;
    }
  }
  return true;
}
