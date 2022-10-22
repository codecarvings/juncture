/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const unknwownName = 'unknown';

export class InjectionToken<T = any> {
  #type: T = undefined!; // Keep the type

  constructor(readonly name = unknwownName) { }

  toString() {
    return `injectionToken:${this.name}`;
  }
}
