/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function defineLazyProperty(object: any, key: PropertyKey, factory: () => any, options: {
  configurable?: boolean, // Default false
  enumerable?: boolean, // Default false
  writable?: boolean // Default false
} = {}) {
  Object.defineProperty(object, key, {
    get: () => {
      const value = factory();
      Object.defineProperty(object, key, {
        value,
        configurable: options.configurable,
        writable: options.writable,
        enumerable: options.enumerable
      });
      return value;
    },
    configurable: true,
    enumerable: options.enumerable
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
