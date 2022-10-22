/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PersistentPath } from '../operation/path';
import { Realm } from '../operation/realm';

export interface DependencyAddress {
  readonly realm: Realm;
  readonly key: string;
}

export interface XpApplicationCassette {
  readonly realms: Set<Realm>;
  readonly values: Set<PersistentPath>;

  clear(): void;
}

export interface ApplicationCassette extends XpApplicationCassette {
  readonly deps: Set<DependencyAddress>;
}

export function createXpApplicationCassette(): XpApplicationCassette {
  const realms = new Set<Realm>();
  const values = new Set<PersistentPath>();
  const clear = () => {
    realms.clear();
    values.clear();
  };

  return { realms, values, clear };
}

export function createApplicationCassette(): ApplicationCassette {
  const realms = new Set<Realm>();
  const values = new Set<PersistentPath>();
  const deps = new Set<DependencyAddress>();
  const clear = () => {
    realms.clear();
    values.clear();
    deps.clear();
  };

  return {
    realms, values, deps, clear
  };
}

export class ApplicationRecorder {
  constructor() {
    this.insertCassette = this.insertCassette.bind(this);
    this.ejectCassette = this.ejectCassette.bind(this);
    this.registerValueApplication = this.registerValueApplication.bind(this);
  }

  protected currentCassette: XpApplicationCassette | ApplicationCassette | null = null;

  insertCassette(cassette: XpApplicationCassette | ApplicationCassette) {
    if (this.currentCassette) {
      throw Error('Cannot insert application cassette: another cassette already present.');
    }
    this.currentCassette = cassette;
  }

  ejectCassette() {
    if (!this.currentCassette) {
      throw Error('Cannot eject application cassette: no cassette present.');
    }

    this.currentCassette = null;
  }

  registerRealmApplication(realm: Realm) {
    if (!this.currentCassette) {
      return;
    }

    this.currentCassette!.realms.add(realm);
  }

  registerValueApplication(path: PersistentPath) {
    if (!this.currentCassette) {
      return;
    }

    this.currentCassette!.values.add(path);
  }

  registerDependencyApplication(dep: DependencyAddress) {
    if (!this.currentCassette) {
      return;
    }

    (this.currentCassette as any).deps.add(dep);
  }
}
