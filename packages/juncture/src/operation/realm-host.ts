/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { junctureSymbols } from '../juncture-symbols';
import { Realm } from './realm';

export interface RealmHost {
  [junctureSymbols.realm]: Realm;
}

export function addRealmLink(container: any, realm: Realm) {
  // eslint-disable-next-line no-param-reassign
  container[junctureSymbols.realm] = realm;
  return container;
}

export function getRealm(host: RealmHost): Realm {
  return host[junctureSymbols.realm];
}

// Used in tests
export function isRealmHost(obj: any): obj is RealmHost {
  if (!obj) {
    return false;
  }
  return obj[junctureSymbols.realm] instanceof Realm;
}
