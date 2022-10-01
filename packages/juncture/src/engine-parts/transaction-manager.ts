/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { pathToString } from '../operation/path';
import { Realm } from '../operation/realm';

export class TransactionManager {
  constructor(protected readonly syncRealms: () => void) {
    this.begin = this.begin.bind(this);
    this.registerAlteredRealm = this.registerAlteredRealm.bind(this);
    this.commit = this.commit.bind(this);
  }

  protected _inProgress = false;

  get inProgress() {
    return this._inProgress;
  }

  protected alteredRealms = new Map<Realm, any>();

  protected completedRealms = new Set<Realm>();

  begin() {
    if (this._inProgress) {
      throw Error('Cannot begin new transaction: already in progress');
    }
    this._inProgress = true;
  }

  registerAlteredRealm(realm: Realm) {
    if (!this._inProgress) {
      // eslint-disable-next-line max-len
      throw Error(`Cannot register altered realm ${pathToString(realm.layout.path)} for transaction: no transaction in progress`);
    }

    if (!this.alteredRealms.has(realm)) {
      this.alteredRealms.set(realm, realm.value);
    }
  }

  commit() {
    if (!this._inProgress) {
      throw Error('Cannot commit transaction: no transaction in progress');
    }

    const { completedRealms } = this;
    const iterateRealm = (realm: Realm) => {
      if (!completedRealms.has(realm)) {
        completedRealms.add(realm);

        // TODO: manage value change

        if (realm.layout.parent) {
          iterateRealm(realm.layout.parent);
        }
      }
    };

    this.alteredRealms.forEach((initialValue, realm) => {
      if (realm.value !== initialValue) {
        iterateRealm(realm);
      }
    });

    completedRealms.clear();
    this.alteredRealms.clear();
    this._inProgress = false;

    this.syncRealms();
  }
}
