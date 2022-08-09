/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isObject } from '../misc/object-helpers';
import { jSymbols } from '../symbols';
import { AccessModifier } from './access-modifier';

export enum DescriptorType {
  schema = 'scm',
  selector = 'sel',
  paramSelector = 'psl',
  reducer = 'red',
  trigger = 'trg',
  reactor = 'rea'
}

export type NotSuitableDescriptor = '\u26A0 ERROR: NOT SUITABLE TYPE';

// Not a class because of AccessModifier implementation (and because so can be easily expanded...)
export interface Descriptor<T extends DescriptorType, P, A extends AccessModifier> {
  readonly type: T;
  readonly [jSymbols.payload]: P;
  readonly access: A;
}

// eslint-disable-next-line max-len
export function createDescriptor<T extends DescriptorType, P, A extends AccessModifier>(type: T, payload: P, access: A): Descriptor<T, P, A> {
  const result: Descriptor<T, P, A> = {
    type,
    [jSymbols.payload]: payload,
    access
  };

  return result;
}

export function isDescriptor(obj: any): obj is Descriptor<any, any, any> {
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

export function getFilteredDescriptorKeys(obj: object, types: DescriptorType[], internalUse: boolean): string[] {
  return Object.keys(obj).filter(key => {
    const prop = (obj as any)[key];
    if (!isDescriptor(prop)) {
      return false;
    }
    if (types.indexOf(prop.type) === -1) {
      return false;
    }

    if (!internalUse && prop.access !== AccessModifier.public) {
      return false;
    }
    return true;
  });
}
