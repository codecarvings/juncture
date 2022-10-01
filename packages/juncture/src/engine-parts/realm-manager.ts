/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { pathToString } from '../operation/path';
import { ManagedRealm, Realm } from '../operation/realm';

interface RealmSnapshot {
  readonly managedRealm: ManagedRealm;
  readonly children: Realm[];
}

export class RealmManager {
  constructor() {
    this.enroll = this.enroll.bind(this);
    this.sync = this.sync.bind(this);
  }

  protected realmsToMount = new Map<Realm, RealmSnapshot>();

  protected realmsToUnmount: Realm[] = [];

  protected mountedRealms = new Map<Realm, RealmSnapshot>();

  protected syncRequired = false;

  enroll(managedRealm: ManagedRealm) {
    if (this.mountedRealms.has(managedRealm.realm) || this.realmsToMount.has(managedRealm.realm)) {
      // eslint-disable-next-line max-len
      throw Error(`Realm manager cannot enroll realm ${pathToString(managedRealm.realm.layout.path)}: already been enrolled`);
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
          throw Error(`Realm manager cannot enroll realm ${pathToString(managedRealm.realm.layout.path)}: cannot find parent realm ${pathToString(parent.layout.path)} `);
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
        throw Error(`Realm manager cannot unmount realm ${pathToString(realm.layout.path)}: not yet mounted`);
      } else {
        throw Error(`Realm manager cannot unmount realm ${pathToString(realm.layout.path)}: not found`);
      }
    }

    this.realmsToUnmount.push(realm);
    this.syncRequired = true;
  }

  sync() {
    if (!this.syncRequired) {
      return;
    }

    if (this.realmsToUnmount.length > 0) {
      const allManagedRealms: ManagedRealm[] = [];
      const iterateRealms = (realms: Realm[]) => {
        realms.forEach(realm => {
          const snapshot = this.mountedRealms.get(realm)!;
          allManagedRealms.push(snapshot.managedRealm);
          iterateRealms(snapshot.children);
        });
      };
      iterateRealms(this.realmsToUnmount);

      allManagedRealms.forEach(managedRealm => {
        this.mountedRealms.delete(managedRealm.realm);
        managedRealm.unmount();
      });

      this.realmsToUnmount.length = 0;
    }

    if (this.realmsToMount.size > 0) {
      this.realmsToMount.forEach(snapshot => {
        this.mountedRealms.set(snapshot.managedRealm.realm, snapshot);
        snapshot.managedRealm.mount();
      });

      this.realmsToMount.clear();
    }

    this.syncRequired = false;
  }
}
