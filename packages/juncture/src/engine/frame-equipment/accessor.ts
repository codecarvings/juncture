/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Gear } from '../gear';
import { getGear } from '../gear-host';
import { OuterBinKit } from '../kits/bin-kit';
import { Cursor } from './cursor';

export function createAccessorFactory(binKey: keyof OuterBinKit): any {
  return (defaultGear: Gear, bins: any) => (_?: Cursor) => {
    const gear = typeof _ !== 'undefined' ? getGear(_) : defaultGear;
    if (gear === defaultGear) {
      return bins[binKey];
    }
    return gear.outerBins[binKey];
  };
}

export function createOuterAccessorFactory(binKey: keyof OuterBinKit): any {
  return (defaultGear: Gear) => (_?: Cursor) => {
    const gear = typeof _ !== 'undefined' ? getGear(_) : defaultGear;
    return gear.outerBins[binKey];
  };
}
