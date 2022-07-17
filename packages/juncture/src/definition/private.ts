/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Def, isDef } from './def';

export interface PrivateSuffix {
  readonly access: 'private';
}

export type Private<D extends Def<any, any, any>> = D & PrivateSuffix;

export type SameAccess<D1, D2 extends Def<any, any, any>> =
  D1 extends PrivateSuffix ? Private<D2> : D2;

export function asPrivate<D extends Def<any, any, any>>(def: D): Private<D> {
  return {
    ...def,
    access: 'private'
  };
}

export function isPrivate(obj: any): obj is Private<Def<any, any, any>> {
  if (!isDef(obj)) {
    return false;
  }
  return (obj as any).access === 'private';
}
