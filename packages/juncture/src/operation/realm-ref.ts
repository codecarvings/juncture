/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { junctureSymbols } from '../juncture-symbols';
import { Path } from './path';
import { Realm } from './realm';
import { addRealmLink } from './realm-host';

export interface RealmRef extends Path {
  [junctureSymbols.realm]: Realm;
}

export function createRealmRef(realm: Realm): RealmRef {
  const ref: any = [...realm.layout.path];
  return addRealmLink(ref, realm);
}
