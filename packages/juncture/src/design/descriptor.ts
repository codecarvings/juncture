/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import { getObjectAttachment, isObject } from '../tool/object';
import { AccessModifier } from './access-modifier';
import { DescriptorType } from './descriptor-type';

// #region Symbols
const intDescriptorCacheSymbol = Symbol('intDescriptorCache');
const extDescriptorCacheSymbol = Symbol('extDescriptorCache');
interface DescriptorSymbols {
  readonly intDescriptorCache: typeof intDescriptorCacheSymbol;
  readonly extDescriptorCache: typeof extDescriptorCacheSymbol;
}
const descriptorSymbols: DescriptorSymbols = {
  intDescriptorCache: intDescriptorCacheSymbol,
  extDescriptorCache: extDescriptorCacheSymbol
};
// #endregion

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
  const cacheSymbol = internalUse ? descriptorSymbols.intDescriptorCache : descriptorSymbols.extDescriptorCache;
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

    if (!internalUse && prop.access !== AccessModifier.public) {
      return false;
    }
    return true;
  });
  keyCache.set(types, value);
  return value;
}
