/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { OuterBinKit } from '../kits/bin-kit';
import { Realm } from '../realm';
import { getRealm } from '../realm-host';
import { Cursor } from './cursor';

export function createAccessorFactory(binKey: keyof OuterBinKit): any {
  return (defaultRealm: Realm, bins: any) => (_?: Cursor) => {
    const realm = typeof _ !== 'undefined' ? getRealm(_) : defaultRealm;
    if (realm === defaultRealm) {
      return bins[binKey];
    }
    return realm.outerBins[binKey];
  };
}

export function createOuterAccessorFactory(binKey: keyof OuterBinKit): any {
  return (defaultRealm: Realm) => (_?: Cursor) => {
    const realm = typeof _ !== 'undefined' ? getRealm(_) : defaultRealm;
    return realm.outerBins[binKey];
  };
}
