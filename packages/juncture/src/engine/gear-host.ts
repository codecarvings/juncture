/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import { Gear } from './gear';

export interface GearHost {
  [jSymbols.gear]: Gear;
}

export function addGearLink(container: any, gear: Gear) {
  // eslint-disable-next-line no-param-reassign
  container[jSymbols.gear] = gear;
  return container;
}

export function getGear(host: GearHost): Gear {
  return host[jSymbols.gear];
}

// Used in tests
export function isGearHost(obj: any): obj is GearHost {
  if (!obj) {
    return false;
  }
  return obj[jSymbols.gear] instanceof Gear;
}
