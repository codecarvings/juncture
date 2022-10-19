/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Subject } from 'rxjs';
import { pathToString, PersistentPath } from '../operation/path';
import { Realm } from '../operation/realm';

// After a reaction:
//  1) Mount and unmount realms
//  2) Emits mutation events
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

  protected readonly valueMutationAckSubject = new Subject<PersistentPath>();

  readonly valueMutationAck$ = this.valueMutationAckSubject.asObservable();

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

  protected iterateRealmForMutation(realm: Realm) {
    if (!this.completedRealms.has(realm)) {
      this.completedRealms.add(realm);

      // TODO: manage value change
      this.valueMutationAckSubject.next(realm.layout.path);

      if (realm.layout.parent) {
        // If a child value changes, also the parent has changed
        this.iterateRealmForMutation(realm.layout.parent);
      }
    }
  }

  commit() {
    if (!this._inProgress) {
      throw Error('Cannot commit transaction: no transaction in progress');
    }

    // Step 1: Mount and unmount realms
    this.syncRealms();

    // Step 2: emit mutation events
    this.alteredRealms.forEach((initialValue, realm) => {
      if (realm.value !== initialValue) {
        this.iterateRealmForMutation(realm);
      }
    });

    // Step 3: Reset status
    this.completedRealms.clear();
    this.alteredRealms.clear();
    this._inProgress = false;
  }
}
