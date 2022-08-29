/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import { Realm } from './realm';

export interface RealmHost {
  [jSymbols.realm]: Realm;
}

export function addRealmLink(container: any, realm: Realm) {
  // eslint-disable-next-line no-param-reassign
  container[jSymbols.realm] = realm;
  return container;
}

export function getRealm(host: RealmHost): Realm {
  return host[jSymbols.realm];
}

// Used in tests
export function isRealmHost(obj: any): obj is RealmHost {
  if (!obj) {
    return false;
  }
  return obj[jSymbols.realm] instanceof Realm;
}
