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

export interface ServiceConfig<J extends Juncture = Juncture> {
  readonly id?: string;
  readonly juncture: J;
  readonly initialValue?: ValueOfJuncture<J>
}

const anonymousServicePrefix = '~';

export class ServiceManager {
  constructor(
    protected readonly state: Map<string, any>,
    protected readonly dismissRealm: (realm: Realm) => void,
    protected readonly syncMount: () => void,
    protected readonly engineRealmMediator: EngineRealmMediator
  ) { }

  protected readonly services = new Map<string, Realm>();

  protected anonymousSerial = 0;

  protected createAnonymousId() {
    this.anonymousSerial += 1;
    return `${anonymousServicePrefix}${this.anonymousSerial}`;
  }

  protected createRealm(id: string, juncture: Juncture) {
    const layout: RealmLayout = {
      path: this.engineRealmMediator.persistentPath.get([id]),
      parent: null,
      isUnivocal: true,
      isDivergent: false
    };
    const realmMediator: RealmMediator = {
      getValue: () => this.state.get(id),
      setValue: newValue => {
        this.state.set(id, newValue);
      }
    };

    return Juncture.createRealm(juncture, layout, realmMediator, this.engineRealmMediator);
  }

  protected createService(config: ServiceConfig): string {
    // Step 1: Calculate the service id
    let id: string;
    if (config.id) {
      id = config.id;
      if (id.length < 1) {
        throw Error('Invalid empty service id.');
      }
      if (id[0] === anonymousServicePrefix) {
        throw Error(`Invalid id "${id}" - A named service id cannot start with the prefix ${anonymousServicePrefix}.`);
      }
      if (this.services.has(id)) {
        throw Error(`Duplicated service id "${id}".`);
      }
    } else {
      id = this.createAnonymousId();
    }

    // Step 2: Update state with the new value
    if (config.initialValue !== undefined) {
      this.state.set(id, config.initialValue);
    } else {
      const schema = Juncture.getSchema(config.juncture);
      this.state.set(id, schema.defaultValue);
    }

    // Step 3: Create the realm
    const realm = this.createRealm(id, config.juncture);
    this.services.set(id, realm);

    return id;
  }

  protected stopService(id: string) {
    const realm = this.services.get(id);
    if (!realm) {
      throw Error(`Cannot stop service "${id}": Not found.`);
    }
    this.dismissRealm(realm);
    this.state.delete(id);
  }

  startServices(configsToStart: ServiceConfig[]): string[] {
    const result = configsToStart.map(config => this.createService(config));
    this.syncMount();
    return result;
  }

  stopServices(idsToStop: string[]) {
    idsToStop.forEach(id => {
      this.stopService(id);
    });
    this.syncMount();
  }

  get serviceIds(): string[] {
    return Array.from(this.services.keys());
  }

  getService(id: string): Realm | undefined {
    return this.services.get(id);
  }

  has(id: string): boolean {
    return this.services.has(id);
  }

  stop() {
    this.stopServices(this.serviceIds);
  }
}
