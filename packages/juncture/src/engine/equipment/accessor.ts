/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Gear } from '../gear';
import { getGear } from '../gear-host';
import { BinKit } from '../kits/bin-kit';
import { Cursor } from './cursor';

export function createAccessorFactory(binKey: keyof BinKit): any {
  return (defaultGear: Gear) => (_?: Cursor) => {
    const gear = typeof _ !== 'undefined' ? getGear(_) : defaultGear;
    return gear.bins[binKey];
  };
}

export function createInternalAccessorFactory(binKey: keyof BinKit): any {
  return (defaultGear: Gear, internalBinHost: any) => (_?: Cursor) => {
    const gear = typeof _ !== 'undefined' ? getGear(_) : defaultGear;
    if (gear === defaultGear) {
      return internalBinHost[binKey];
    }
    return gear.bins[binKey];
  };
}
