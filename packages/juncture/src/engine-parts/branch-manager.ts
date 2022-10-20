/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { EngineRealmMediator } from '../engine';
import { Juncture, ValueOfJuncture } from '../juncture';
import { Realm, RealmLayout, RealmMediator } from '../operation/realm';
import { RealmManager } from './realm-manager';

export interface BranchConfig<J extends Juncture = Juncture> {
  readonly id?: string;
  readonly juncture: J;
  readonly initialValue?: ValueOfJuncture<J>
}

const anonymousBranchPrefix = '~';

export class BranchManager {
  constructor(
    protected readonly engineRealmMediator: EngineRealmMediator,
    protected readonly realmManager: RealmManager,
    protected readonly storage: Map<string, any>
  ) { }

  protected readonly breanches = new Map<string, Realm>();

  protected anonymousSerial = 0;

  protected createAnonymousId() {
    this.anonymousSerial += 1;
    return `${anonymousBranchPrefix}${this.anonymousSerial}`;
  }

  protected createRealm(id: string, juncture: Juncture) {
    const layout: RealmLayout = {
      path: this.engineRealmMediator.persistentPath.get([id]),
      parent: null,
      isUnivocal: true,
      isDivergent: false
    };
    const realmMediator: RealmMediator = {
      getValue: () => this.storage.get(id),
      setValue: newValue => {
        this.storage.set(id, newValue);
      }
    };

    return Juncture.createRealm(juncture, layout, realmMediator, this.engineRealmMediator);
  }

  protected createBranch(config: BranchConfig): string {
    let id: string;
    if (config.id) {
      id = config.id;
      if (id.length < 1) {
        throw Error('Invalid empty branch id');
      }
      if (id[0] === anonymousBranchPrefix) {
        throw Error(`Invalid id "${id}" - A named branch id cannot start with the prefix ${anonymousBranchPrefix}`);
      }
      if (this.breanches.has(id)) {
        throw Error(`Duplicated branch id "${id}".`);
      }
    } else {
      id = this.createAnonymousId();
    }

    if (config.initialValue !== undefined) {
      this.storage.set(id, config.initialValue);
    } else {
      const schema = Juncture.getSchema(config.juncture);
      this.storage.set(id, schema.defaultValue);
    }

    const realm = this.createRealm(id, config.juncture);
    this.breanches.set(id, realm);
    return id;
  }

  protected dismissBranch(id: string) {
    const realm = this.breanches.get(id);
    if (!realm) {
      throw Error(`Cannot unmount branch "${id}": not found`);
    }
    this.realmManager.dismiss(realm);
    this.storage.delete(id);
  }

  mountBranches(configsToMount: BranchConfig[]): string[] {
    const result = configsToMount.map(config => this.createBranch(config));
    this.realmManager.sync();
    return result;
  }

  unmountBranches(idsToUnmount: string[]) {
    idsToUnmount.forEach(id => {
      this.dismissBranch(id);
    });
    this.realmManager.sync();
  }

  get branchIds(): string[] {
    return Array.from(this.breanches.keys());
  }

  getBranch(id: string): Realm | undefined {
    return this.breanches.get(id);
  }

  has(id: string): boolean {
    return this.breanches.has(id);
  }

  unmountAll() {
    this.unmountBranches(this.branchIds);
  }
}
