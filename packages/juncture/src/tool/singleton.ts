/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Constructable } from './constructable';
import { initialize, isInitializable } from './initializable';

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
  protected constructor(readonly Constructor: T, readonly instance: InstanceType<T>) { }

  static get<T extends Constructable>(Constructor: T): Singleton<T> {
    if ((Constructor as any)[singletonSymbols.singletonCache]) {
      const singleton = (Constructor as any)[singletonSymbols.singletonCache] as Singleton<T>;
      // When subclassng a Constructor that already has the singleton...
      if (singleton.Constructor === Constructor) {
        return singleton;
      }
    }

    const instance = new Constructor();
    if (isInitializable(instance)) {
      initialize(instance);
    }
    const result = new Singleton(Constructor, instance);
    // eslint-disable-next-line no-param-reassign
    (Constructor as any)[singletonSymbols.singletonCache] = result;
    return result;
  }

  static getInstance<T extends Constructable>(Constructor: T): InstanceType<T>;
  static getInstance<T>(instance: T): T;
  static getInstance(intance_or_Constructor: any) {
    if (typeof intance_or_Constructor === 'function') {
      return Singleton.get(intance_or_Constructor).instance;
    }
    return intance_or_Constructor;
  }
}
