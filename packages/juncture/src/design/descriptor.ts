/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../access';
import { jSymbols } from '../symbols';
import { getObjectAttachment, isObject } from '../tool/object';
import { DescriptorType } from './descriptor-type';

// #region Symbols
const descriptorCacheSymbol = Symbol('descriptorCache');
const outerDescriptorCacheSymbol = Symbol('outerDescriptorCacheSymbol');
interface DescriptorSymbols {
  readonly descriptorCache: typeof descriptorCacheSymbol;
  readonly outerDescriptorCache: typeof outerDescriptorCacheSymbol;
}
const descriptorSymbols: DescriptorSymbols = {
  descriptorCache: descriptorCacheSymbol,
  outerDescriptorCache: outerDescriptorCacheSymbol
};
// #endregion

// Not a class because of AccessModifier implementation (and because so can be easily expanded...)
export interface Descriptor<T extends DescriptorType, V, A extends AccessModifier> {
  readonly type: T;
  readonly [jSymbols.payload]: V;
  readonly access: A;
}

// eslint-disable-next-line max-len
export function createDescriptor<T extends DescriptorType, V, A extends AccessModifier>(type: T, payload: V, access: A): Descriptor<T, V, A> {
  const result: Descriptor<T, V, A> = {
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

export function getFilteredDescriptorKeys(obj: object, types: DescriptorType[], outerFilter: boolean): string[] {
  const cacheSymbol = outerFilter ? descriptorSymbols.outerDescriptorCache : descriptorSymbols.descriptorCache;
  const keyCache = getObjectAttachment(obj, cacheSymbol, () => new Map<DescriptorType[], string[]>());
  if (keyCache.has(types)) {
    return keyCache.get(types)!;
  }

  const value = Object.keys(obj).filter(key => {
    const prop = (obj as any)[key];
    if (!isDescriptor(prop)) {
      return false;
    }
    if (types.indexOf(prop.type) === -1) {
      return false;
    }

    if (outerFilter && prop.access !== AccessModifier.public) {
      return false;
    }
    return true;
  });
  keyCache.set(types, value);
  return value;
}
