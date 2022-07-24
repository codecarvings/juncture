/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function defineGetter(object: any, key: PropertyKey, fn: () => any, enumerable?: boolean) {
  Object.defineProperty(object, key, {
    get: fn,
    configurable: false,
    enumerable
  });
}

export function defineLazyProperty(object: any, key: PropertyKey, factory: () => any, enumerable?: boolean) {
  Object.defineProperty(object, key, {
    get: () => {
      const value = factory();
      Object.defineProperty(object, key, {
        value, configurable: false, writable: false, enumerable
      });
      return value;
    },
    configurable: true,
    enumerable
  });
}

export function mappedAssign(object: any, keys: ReadonlyArray<string>, mapFn: (key: string) => any): any {
  // eslint-disable-next-line no-param-reassign
  keys.forEach(key => { object[key] = mapFn(key); });
  return object;
}

export function isObject(obj: any): obj is any {
  if (typeof obj !== 'object') {
    return false;
  }
  if (obj === null) {
    return false;
  }

  return true;
}

export interface Constructable<T = any> {
  new(): T;
}
