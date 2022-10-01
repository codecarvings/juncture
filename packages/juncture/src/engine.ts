/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { BranchConfig, BranchManager } from './engine-parts/branch-manager';
import { PersistentPathManager } from './engine-parts/persistent-path-manager';
import { RealmManager } from './engine-parts/realm-manager';
import { SelectorCatalyst } from './engine-parts/selector-catalyst';
import { TransactionManager } from './engine-parts/transaction-manager';
import { ValueUsageMonitor } from './engine-parts/value-usage-monitor';
import { Juncture } from './juncture';
import { Action } from './operation/action';
import { QueryFrame } from './operation/frames/query-frame';
import { createUnbindedFrame } from './operation/frames/unbinded-frame';
import { Path, pathToString, PersistentPath } from './operation/path';
import {
    ControlledRealm, ManagedRealm, Realm, RealmLayout, RealmMediator, RealmMountStatus
} from './operation/realm';
import { getRealm, isRealmHost } from './operation/realm-host';
import { Query, QueryItem } from './queries/query';
import { mappedAssign } from './utilities/object';

export enum EngineStatus {
  running = 'running',
  stopped = 'stopped'
}

export interface EngineRealmMediator {
  readonly persistentPath: {
    get(path: Path): PersistentPath;
    release(path: PersistentPath): void;
  }

  readonly realm: {
    enroll(managedRealm: ManagedRealm): void
    createControlled(juncture: Juncture, layout: RealmLayout, realmMediator: RealmMediator): ControlledRealm;
  };

  readonly selection: {
    registerValueUsage(path: PersistentPath): void;
  }

  readonly reaction: {
    dispatch(action: Action): void;
    registerAlteredRealm(realm: Realm): void;
  };
}

export class Engine {
  constructor() {
    this.dispatch = this.dispatch.bind(this);

    this.persistentPathManager = this.createPersistentPathManager();
    this.realmManager = this.createRealmManger();
    this.valueUsageMonitor = this.createValueUsageMonitor();
    this.transactionManager = this.createTransactionManager();
    this.branchManager = this.createBranchManager();
    this.selectorCatalyst = this.craeteSelectorCatalyst();
  }

  // #region Engine Parts
  protected readonly persistentPathManager: PersistentPathManager;

  // eslint-disable-next-line class-methods-use-this
  protected createPersistentPathManager(): PersistentPathManager {
    return new PersistentPathManager();
  }

  protected readonly realmManager: RealmManager;

  // eslint-disable-next-line class-methods-use-this
  protected createRealmManger(): RealmManager {
    return new RealmManager();
  }

  protected readonly valueUsageMonitor: ValueUsageMonitor;

  // eslint-disable-next-line class-methods-use-this
  protected createValueUsageMonitor(): ValueUsageMonitor {
    return new ValueUsageMonitor();
  }

  protected readonly transactionManager: TransactionManager;

  protected createTransactionManager(): TransactionManager {
    return new TransactionManager(this.realmManager.sync);
  }

  protected readonly branchManager: BranchManager;

  protected createBranchManager(): BranchManager {
    const engineRealmMediator: EngineRealmMediator = {
      persistentPath: {
        get: this.persistentPathManager.getPersistentPath,
        release: this.persistentPathManager.releaseRequirement
      },
      realm: {
        enroll: this.realmManager.enroll,
        createControlled: (Juncture2, layout2, realmMediator2) => {
          const realm = Juncture.createRealm(Juncture2, layout2, realmMediator2, engineRealmMediator);
          return {
            realm,
            scheduleUnmount: () => {
              this.realmManager.dismiss(realm);
            }
          };
        }
      },
      selection: {
        registerValueUsage: this.valueUsageMonitor.registerValueUsage
      },
      reaction: {
        dispatch: this.dispatch,
        registerAlteredRealm: this.transactionManager.registerAlteredRealm
      }
    };

    return new BranchManager(engineRealmMediator, this.realmManager, this.state);
  }

  protected readonly selectorCatalyst: SelectorCatalyst;

  protected craeteSelectorCatalyst(): SelectorCatalyst {
    return new SelectorCatalyst(this.valueUsageMonitor, this.persistentPathManager);
  }

  // #endregion

  // #region Status stuff
  protected _status = EngineStatus.running;

  get status(): EngineStatus {
    return this._status;
  }

  stop() {
    if (this.status === EngineStatus.stopped) {
      throw Error('Engine already stopped');
    }

    this.branchManager.unmountAllBranches();
    this._status = EngineStatus.stopped;
  }
  // #endregion

  // #region Value stuff
  readonly state: any = {};

  startSelectorAudit(): () => Observable<void> {
    return this.selectorCatalyst.startAudit();
  }

  dispatch(action: Action) {
    const target = this.getRealm(action.target);

    this.transactionManager.begin();
    target.executeAction(action.key, action.payload);
    this.transactionManager.commit();

    if (action.callback) {
      action.callback();
    }
  }
  // #endregion

  // #region Branch stuff
  mountBranch<J extends Juncture>(juncture: J): string;
  mountBranch<J extends Juncture>(config: BranchConfig<J>): string;
  mountBranch(juncture_or_config: Juncture | BranchConfig) {
    let config: BranchConfig;
    if (typeof juncture_or_config === 'function') {
      config = { juncture: juncture_or_config };
    } else {
      config = juncture_or_config;
    }
    return this.branchManager.mountBranches([config])[0];
  }

  mountBranches(configs: BranchConfig[]): string[] {
    return this.branchManager.mountBranches(configs);
  }

  unmountBranch(key: string) {
    this.branchManager.unmountBranches([key]);
  }

  unmountBranches(keys: string[]) {
    this.branchManager.unmountBranches(keys);
  }

  protected getRealm(path: Path): Realm {
    if (isRealmHost(path)) {
      const result = getRealm(path);
      if (result.mountStatus !== RealmMountStatus.unmounted) {
        return result;
      }
    }

    const pathLen = path.length;
    if (pathLen === 0) {
      throw Error('Cannot resolve empty path []');
    }
    const branchKey = path[0];
    if (typeof branchKey !== 'string') {
      // eslint-disable-next-line max-len
      throw Error(`Cannot resolve path ${pathToString(path)}: Invalid branch key type (${typeof branchKey}), must be a string`);
    }
    const realm = this.branchManager.getBranch(path[0] as string);
    if (realm === undefined) {
      throw Error(`Cannot resolve path ${pathToString(path)}: Branch "${typeof branchKey}" not mounted`);
    }
    let result = realm;
    for (let i = 1; i < pathLen; i += 1) {
      result = result.getChildRealm(path[i]);
    }
    return result;
  }

  // TODO: Implement this
  protected getRealmFromQueryItem(item: QueryItem): Realm {
    const juncture = typeof item === 'function' ? item : item.juncture;
    const keys = this.branchManager.branchKeys;
    for (let i = 0; i < keys.length; i += 1) {
      const realm = this.branchManager.getBranch(keys[i]);
      if (realm?.driver.constructor === juncture) {
        return realm;
      }
    }

    throw Error('Unable to find a frame for the specified QueryItem');
  }

  createFrame<Q extends Query>(query: Q): QueryFrame<Q> {
    const keys = Object.keys(query);
    const cursor = mappedAssign({}, keys, key => this.getRealmFromQueryItem(query[key]).xpCursor);
    return createUnbindedFrame(cursor);
  }
  // #endregion
}
