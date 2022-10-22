/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface Dismissible {
  dismiss(): void;
}

export function isDismissible(obj: any): obj is Dismissible {
  if (obj === null || obj === undefined) {
    return false;
  }

  if (typeof obj.dismiss !== 'function') {
    return false;
  }

  return true;
}
