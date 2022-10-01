/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BinKit, XpBinKit } from '../kits/bin-kit';
import { pathToString } from '../path';
import { Realm } from '../realm';
import { getRealm } from '../realm-host';
import { Cursor } from './cursor';

export function createInnerPickerFactory(binKey: keyof BinKit): any {
  return (defaultRealm: Realm, bins: any) => (_?: Cursor) => {
    const realm = typeof _ !== 'undefined' ? getRealm(_) : defaultRealm;
    if (realm === defaultRealm) {
      return bins[binKey];
    }
    throw Error(`Unable to access bin ${binKey} for path ${pathToString(realm.layout.path)}`);
  };
}

export function createPickerFactory(binKey: keyof XpBinKit): any {
  return (defaultRealm: Realm, bins: any) => (_?: Cursor) => {
    const realm = typeof _ !== 'undefined' ? getRealm(_) : defaultRealm;
    if (realm === defaultRealm) {
      return bins[binKey];
    }
    return realm.xpBins[binKey];
  };
}

export function createXpPickerFactory(binKey: keyof XpBinKit): any {
  return (defaultRealm: Realm) => (_?: Cursor) => {
    const realm = typeof _ !== 'undefined' ? getRealm(_) : defaultRealm;
    return realm.xpBins[binKey];
  };
}
