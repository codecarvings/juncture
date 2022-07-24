/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import { isObject } from '../util/object';

export interface Initializable {
  [jSymbols.init](): void;
}

export function isInitializable(obj: any): obj is Initializable {
  if (!isObject(obj)) {
    return false;
  }

  if (typeof obj[jSymbols.init] !== 'function') {
    return false;
  }

  return true;
}

export function initialize(obj: Initializable) {
  obj[jSymbols.init]();
}
