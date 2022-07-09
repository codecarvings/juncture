/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Def } from './def';

export interface PrivateSuffix {
  readonly access: 'private';
}

export type Private<D extends Def<any, any, any>> = D & PrivateSuffix;

export function asPrivate<D extends Def<any, any, any>>(def: D): Private<D> {
  return {
    ...def,
    access: 'private'
  };
}
