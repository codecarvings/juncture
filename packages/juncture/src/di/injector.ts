/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DependencyKey, dependencyKeyToString, DependencyType } from './dependency';

export class Injector {
  constructor(
    protected readonly parentInjector: Injector | null
  ) { }

  protected readonly statedResolveCache = new Map<DependencyKey, any>();

  statedResolve<K extends DependencyKey>(key: K): DependencyType<K> {
    // Step 1: Check the cache
    if (this.statedResolveCache.has(key)) {
      return this.statedResolveCache.get(key);
    }

    // Step 2: Resolvers configured in farther realms win
    let result: any;
    if (this.parentInjector) {
      result = this.parentInjector.statedResolve(key);
    }

    // Step 3:
    if (result === undefined) {
      // result = this.getOwnInstance(key);
    }

    // Step 4: Cache te result
    this.statedResolveCache.set(key, result);
    return result;
  }

  resolve<K extends DependencyKey>(key: K): DependencyType<K>;
  resolve<K extends DependencyKey>(key: K, isOptional: true): DependencyType<K> | undefined;
  resolve<K extends DependencyKey>(key: K, isOptional?: boolean) {
    // Step 1: Try to user stated resolvers
    const result = this.statedResolve(key);

    // if (result === undefined) {
    //   if (isJunctureType(key)) {
    //     result = this.hierarchicalAutoResolve(key as JunctureType, ext, this.toString());
    //   }
    // }

    if (result === undefined && !isOptional) {
      throw Error(`Unable to resolve dependency key '${dependencyKeyToString(key)}'`);
    }
    return result;
  }
}
