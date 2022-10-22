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

// Used to create actions
// - If I always pass a path as target for actions, I have always to find the corresponding Realm
// - If I always pass a Realm, if that realm is umounted before the action is executed, an error occurs
// By using a "RealmRef", the engine first tries to use the realm (if is mounted). If it's unmounted trie
// to use the path to find a realm (if exists...).
export interface RealmRef extends Path {
  [junctureSymbols.realm]: Realm;
}

export function createRealmRef(realm: Realm): RealmRef {
  const ref: any = [...realm.layout.path];
  return addRealmLink(ref, realm);
}
