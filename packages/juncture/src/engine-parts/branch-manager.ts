/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EngineRealmMediator } from '../engine';
import { Juncture, ValueOfJuncture } from '../juncture';
import { Realm, RealmLayout, RealmMediator } from '../operation/realm';
import { RealmManager } from './realm-manager';

export interface BranchConfig<J extends Juncture = Juncture> {
  readonly key?: string;
  readonly juncture: J;
  readonly initialValue?: ValueOfJuncture<J>
}

const anonymousBranchPrefix = '~';

export class BranchManager {
  constructor(
    protected readonly engineRealmMediator: EngineRealmMediator,
    protected readonly realmManager: RealmManager,
    protected readonly value: any
  ) { }

  protected readonly breanches = new Map<string, Realm>();

  protected anonymousSerial = 0;

  protected createAnonymousKey() {
    this.anonymousSerial += 1;
    return `${anonymousBranchPrefix}${this.anonymousSerial}`;
  }

  protected createRealm(key: string, juncture: Juncture) {
    const layout: RealmLayout = {
      path: this.engineRealmMediator.persistentPath.get([key]),
      parent: null,
      isUnivocal: true,
      isDivergent: false
    };
    const realmMediator: RealmMediator = {
      getValue: () => this.value[key],
      setValue: newValue => {
        this.value[key] = newValue;
      }
    };

    return Juncture.createRealm(juncture, layout, realmMediator, this.engineRealmMediator);
  }

  protected createBranch(config: BranchConfig): string {
    let key: string;
    if (config.key) {
      key = config.key;
      if (key.length < 1) {
        throw Error('Invalid empty branch key');
      }
      if (key[0] === anonymousBranchPrefix) {
        throw Error(`Invalid key "${key}" - A named branch key cannot start with the prefix ${anonymousBranchPrefix}`);
      }
      if (this.breanches.has(key)) {
        throw Error(`Duplicated branch key "${key}".`);
      }
    } else {
      key = this.createAnonymousKey();
    }

    if (config.initialValue !== undefined) {
      this.value[key] = config.initialValue;
    } else {
      const schema = Juncture.getSchema(config.juncture);
      this.value[key] = schema.defaultValue;
    }

    const realm = this.createRealm(key, config.juncture);
    this.breanches.set(key, realm);
    return key;
  }

  protected dismissBranch(key: string) {
    const realm = this.breanches.get(key);
    if (!realm) {
      throw Error(`Cannot unmount branch "${key}": not found`);
    }
    this.realmManager.dismiss(realm);
    delete this.value[key];
  }

  mountBranches(configsToMount: BranchConfig[]): string[] {
    const result = configsToMount.map(config => this.createBranch(config));
    this.realmManager.sync();
    return result;
  }

  unmountBranches(keysToUnmount: string[]) {
    keysToUnmount.forEach(key => {
      this.dismissBranch(key);
    });
    this.realmManager.sync();
  }

  get branchKeys(): string[] {
    return Array.from(this.breanches.keys());
  }

  getBranch(key: string): Realm | undefined {
    return this.breanches.get(key);
  }

  has(key: string): boolean {
    return this.breanches.has(key);
  }

  unmountAll() {
    this.unmountBranches(this.branchKeys);
  }
}
