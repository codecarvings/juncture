/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable, Subject } from 'rxjs';
import { pathToString, PersistentPath } from '../operation/path';
import { Realm } from '../operation/realm';

// After a reaction:
//  1) Mount and unmount realms
//  2) Emits mutation events
export class TransactionManager {
  constructor(
    protected readonly syncRealms: () => void
  ) {
    this.begin = this.begin.bind(this);
    this.registerAlteredRealm = this.registerAlteredRealm.bind(this);
    this.commit = this.commit.bind(this);

    this.valueMutationAckSubject = new Subject<PersistentPath>();
    this.valueMutationAck$ = this.valueMutationAckSubject.asObservable();
  }

  protected _inProgress = false;

  get inProgress() {
    return this._inProgress;
  }

  protected alteredRealms = new Set<Realm>();

  protected completedRealms = new Set<Realm>();

  protected readonly valueMutationAckSubject: Subject<PersistentPath>;

  readonly valueMutationAck$: Observable<PersistentPath>;

  begin() {
    if (this._inProgress) {
      throw Error('Cannot begin new transaction: Already in progress.');
    }
    this._inProgress = true;
  }

  registerAlteredRealm(realm: Realm) {
    if (!this._inProgress) {
      // eslint-disable-next-line max-len
      throw Error(`Cannot register altered realm ${pathToString(realm.layout.path)} for transaction: No transaction in progress.`);
    }

    this.alteredRealms.add(realm);
  }

  protected iterateRealmForMutation(realm: Realm) {
    if (!this.completedRealms.has(realm)) {
      this.completedRealms.add(realm);

      // TODO: manage value change
      this.valueMutationAckSubject.next(realm.layout.path);

      if (realm.layout.parent) {
        // If a child value changes, the parent also has changed
        this.iterateRealmForMutation(realm.layout.parent);
      }
    }
  }

  commit() {
    if (!this._inProgress) {
      throw Error('Cannot commit transaction: No transaction in progress');
    }

    // Step 1: Mount and unmount realms
    this.syncRealms();

    // Step 2: emit mutation events
    this.alteredRealms.forEach(realm => {
      this.iterateRealmForMutation(realm);
    });

    // Step 3: Reset condition
    this.completedRealms.clear();
    this.alteredRealms.clear();
    this._inProgress = false;
  }

  stop() {
    this.valueMutationAckSubject.complete();
  }
}
