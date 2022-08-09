/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import { Gear } from './gear';
import { addGearLink } from './gear-host';
import { Path } from './path';

export interface GearRef extends Path {
  [jSymbols.gear]: Gear;
}

export function createGearRef(gear: Gear): GearRef {
  const ref: any = [...gear.layout.path];
  return addGearLink(ref, gear);
}
