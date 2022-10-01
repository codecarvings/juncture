/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { junctureSymbols } from '../juncture-symbols';
import { isObject } from './object';

export interface Initializable {
  [junctureSymbols.init](): void;
}

export function isInitializable(obj: any): obj is Initializable {
  if (!isObject(obj)) {
    return false;
  }

  if (typeof obj[junctureSymbols.init] !== 'function') {
    return false;
  }

  return true;
}

export function initialize(obj: Initializable) {
  obj[junctureSymbols.init]();
}
