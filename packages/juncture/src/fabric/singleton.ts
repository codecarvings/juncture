/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Constructable } from '../util/object';
import { initialize, isInitializable } from './initializable';

// --- Symbols
const singletonCacheSymbol = Symbol('singletonCache');
interface SingletonSymbols {
  readonly singletonCache: typeof singletonCacheSymbol;
}
const singletonSymbols: SingletonSymbols = {
  singletonCache: singletonCacheSymbol
};

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
}
