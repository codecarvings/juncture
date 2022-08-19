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
  protected constructor(readonly Ctor: T, readonly instance: InstanceType<T>) { }

  static get<T extends Constructable>(Ctor: T): Singleton<T> {
    if ((Ctor as any)[singletonSymbols.singletonCache]) {
      const singleton = (Ctor as any)[singletonSymbols.singletonCache] as Singleton<T>;
      // When subclassng a Ctor that already has the singleton...
      if (singleton.Ctor === Ctor) {
        return singleton;
      }
    }

    const instance = new Ctor();
    if (isInitializable(instance)) {
      initialize(instance);
    }
    const result = new Singleton(Ctor, instance);
    // eslint-disable-next-line no-param-reassign
    (Ctor as any)[singletonSymbols.singletonCache] = result;
    return result;
  }

  static getInstance<T extends Constructable>(Ctor: T): InstanceType<T>;
  static getInstance<T>(instance: T): T;
  static getInstance(intance_or_Ctor: any) {
    if (typeof intance_or_Ctor === 'function') {
      return Singleton.get(intance_or_Ctor).instance;
    }
    return intance_or_Ctor;
  }
}
