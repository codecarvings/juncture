/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable, Subject } from 'rxjs';
import { pathToString } from '../operation/path';
import { ManagedRealm, Realm } from '../operation/realm';

interface RealmSnapshot {
  readonly managedRealm: ManagedRealm;
  readonly children: Realm[];
}

interface SyncMountAckData {
  readonly unmounted: Realm[];
  readonly mounted: Realm[];
}

export class RealmManager {
  constructor() {
    this.enroll = this.enroll.bind(this);
    this.dismiss = this.dismiss.bind(this);
    this.syncMount = this.syncMount.bind(this);

    this.syncMountAckSubject = new Subject<SyncMountAckData>();
    this.syncMountAck$ = this.syncMountAckSubject.asObservable();
  }

  protected realmsToMount = new Map<Realm, RealmSnapshot>();

  protected realmsToUnmount: Realm[] = [];

  protected mountedRealms = new Map<Realm, RealmSnapshot>();

  protected syncRequired = false;

  protected readonly syncMountAckSubject: Subject<SyncMountAckData>;

  readonly syncMountAck$: Observable<SyncMountAckData>;

  enroll(managedRealm: ManagedRealm) {
    if (this.mountedRealms.has(managedRealm.realm) || this.realmsToMount.has(managedRealm.realm)) {
      // eslint-disable-next-line max-len
      throw Error(`Realm manager cannot enroll Realm ${pathToString(managedRealm.realm.layout.path)}: Already been enrolled.`);
    }

    const { parent } = managedRealm.realm.layout;
    if (parent) {
      let parentSnapshot = this.mountedRealms.get(parent);
      if (parentSnapshot) {
        parentSnapshot.children.push(managedRealm.realm);
      } else {
        parentSnapshot = this.realmsToMount.get(parent);
        if (parentSnapshot) {
          parentSnapshot.children.push(managedRealm.realm);
        } else {
          // eslint-disable-next-line max-len
          throw Error(`Realm manager cannot enroll Realm ${pathToString(managedRealm.realm.layout.path)}: Cannot find parent realm ${pathToString(parent.layout.path)}.`);
        }
      }
    }

    this.realmsToMount.set(managedRealm.realm, {
      managedRealm,
      children: []
    });

    this.syncRequired = true;
  }

  dismiss(realm: Realm) {
    if (!this.mountedRealms.has(realm)) {
      if (this.realmsToMount.has(realm)) {
        throw Error(`Realm manager cannot unmount Realm ${pathToString(realm.layout.path)}: Not yet mounted.`);
      } else {
        throw Error(`Realm manager cannot unmount Realm ${pathToString(realm.layout.path)}: Not found.`);
      }
    }

    this.realmsToUnmount.push(realm);
    this.syncRequired = true;
  }

  #SyncMountAckData: SyncMountAckData = {
    unmounted: [],
    mounted: []
  };

  syncMount() {
    if (!this.syncRequired) {
      return;
    }

    const { unmounted, mounted } = this.#SyncMountAckData;

    if (this.realmsToUnmount.length > 0) {
      const managedRealmsToUnmount: ManagedRealm[] = [];
      const iterateRealms = (realms: Realm[]) => {
        realms.forEach(realm => {
          unmounted.push(realm);

          const snapshot = this.mountedRealms.get(realm)!;
          managedRealmsToUnmount.push(snapshot.managedRealm);
          iterateRealms(snapshot.children);
        });
      };
      iterateRealms(this.realmsToUnmount);

      managedRealmsToUnmount.forEach(managedRealm => {
        this.mountedRealms.delete(managedRealm.realm);
        managedRealm.unmount();
      });

      this.realmsToUnmount.length = 0;
    }

    if (this.realmsToMount.size > 0) {
      this.realmsToMount.forEach(snapshot => {
        mounted.push(snapshot.managedRealm.realm);

        this.mountedRealms.set(snapshot.managedRealm.realm, snapshot);
        snapshot.managedRealm.mount();
      });

      this.realmsToMount.clear();
    }

    this.syncMountAckSubject.next(this.#SyncMountAckData);

    unmounted.length = 0;
    mounted.length = 0;

    this.syncRequired = false;
  }

  stop() {
    this.syncMountAckSubject.complete();
  }
}
