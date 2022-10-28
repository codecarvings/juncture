/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../access-modifier';
import { junctureSymbols } from '../juncture-symbols';
import { isObject } from '../utilities/object';
import { DescriptorType } from './descriptor-type';

// Not a class because of AccessModifier implementation (and because so can be easily expanded...)
export interface Descriptor<T extends DescriptorType = any, V = any, A extends AccessModifier = any> {
  readonly type: T;
  readonly [junctureSymbols.payload]: V;
  readonly access: A;
}

export function createDescriptor<T extends DescriptorType, V, A extends AccessModifier>(
  type: T,
  payload: V,
  access: A
): Descriptor<T, V, A> {
  const result: Descriptor<T, V, A> = {
    type,
    [junctureSymbols.payload]: payload,
    access
  };

  return result;
}

export function isDescriptor(obj: any): obj is Descriptor {
  if (!isObject(obj)) {
    return false;
  }

  if (typeof obj.type !== 'string') {
    return false;
  }

  if (typeof obj.access !== 'string') {
    return false;
  }

  return true;
}
