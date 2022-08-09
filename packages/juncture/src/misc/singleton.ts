/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { initialize, isInitializable } from './initializable';
import { Constructable } from './object-helpers';

// #region Symbols
const singletonCacheSymbol = Symbol('singletonCache');
interface SingletonSymbols {
  readonly singletonCache: typeof singletonCacheSymbol;
}
const singletonSymbols: SingletonSymbols = {
  singletonCache: singletonCacheSymbol
};
// #endregion

export class Singleton<T extends Constructable> {
  protected constructor(readonly Type: T, readonly instance: InstanceType<T>) { }

  static get<T extends Constructable>(Type: T): Singleton<T> {
    if ((Type as any)[singletonSymbols.singletonCache]) {
      const singleton = (Type as any)[singletonSymbols.singletonCache] as Singleton<T>;
      // When subclassng a Type that already has the singleton...
      if (singleton.Type === Type) {
        return singleton;
      }
    }

    const instance = new Type();
    if (isInitializable(instance)) {
      initialize(instance);
    }
    const result = new Singleton(Type, instance);
    // eslint-disable-next-line no-param-reassign
    (Type as any)[singletonSymbols.singletonCache] = result;
    return result;
  }

  static getAttachment(
    cacheKey: symbol,
    resolverFn: (instance: any) => any
  ): (intance_or_Type: any) => any {
    return (intance_or_Type: any) => {
      let instance: any;
      if (typeof intance_or_Type === 'function') {
        instance = Singleton.get(intance_or_Type).instance;
      } else {
        instance = intance_or_Type;
      }

      if (instance[cacheKey]) {
        return instance[cacheKey].val;
      }

      const val = resolverFn(instance);
      instance[cacheKey] = { val };
      return val;
    };
  }
}
