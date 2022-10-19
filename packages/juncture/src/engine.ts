/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ActiveQueryFrameHandler, ActiveQueryManager } from './engine-parts/active-query-manager';
import { BranchConfig, BranchManager } from './engine-parts/branch-manager';
import { PersistentPathManager } from './engine-parts/persistent-path-manager';
import { RealmManager } from './engine-parts/realm-manager';
import { TransactionManager } from './engine-parts/transaction-manager';
import { ValueUsageRecorder } from './engine-parts/value-usage-recorder';
import { isJuncture, Juncture } from './juncture';
import { Action } from './operation/action';
import { Cursor } from './operation/frame-equipment/cursor';
import { QueryFrame } from './operation/frames/query-frame';
import { createUnboundFrame } from './operation/frames/unbound-frame';
import { Path, pathToString, PersistentPath } from './operation/path';
import {
  ControlledRealm, ManagedRealm, Realm, RealmLayout, RealmMediator, RealmMountStatus
} from './operation/realm';
import { getRealm, isRealmHost } from './operation/realm-host';
import { ActiveQuery } from './query/active-query';
import { Query, QueryItem } from './query/query';
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
    this.mountBranches = this.mountBranches.bind(this);
    this.unmountBranches = this.unmountBranches.bind(this);
    this.getXpCursorFromQueryItem = this.getXpCursorFromQueryItem.bind(this);

    this.persistentPathManager = this.createPersistentPathManager();
    this.realmManager = this.createRealmManger();
    this.valueUsageRecorder = this.createValueUsageRecorder();
    this.transactionManager = this.createTransactionManager();
    this.branchManager = this.createBranchManager();
    this.activeQueryManager = this.createActiveQueryManager();
  }

  readonly state: any = {};

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

  protected readonly valueUsageRecorder: ValueUsageRecorder;

  // eslint-disable-next-line class-methods-use-this
  protected createValueUsageRecorder(): ValueUsageRecorder {
    return new ValueUsageRecorder();
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
        registerValueUsage: this.valueUsageRecorder.registerValueUsage
      },
      reaction: {
        dispatch: this.dispatch,
        registerAlteredRealm: this.transactionManager.registerAlteredRealm
      }
    };

    return new BranchManager(engineRealmMediator, this.realmManager, this.state);
  }

  protected readonly activeQueryManager: ActiveQueryManager;

  protected createActiveQueryManager(): ActiveQueryManager {
    return new ActiveQueryManager(
      this.mountBranches,
      this.unmountBranches,
      this.getXpCursorFromQueryItem,
      this.valueUsageRecorder.useCassette,
      this.valueUsageRecorder.ejectCassette,
      this.transactionManager.valueMutationAck$
    );
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

    this.activeQueryManager.releaseAll();
    this.branchManager.unmountAll();

    this._status = EngineStatus.stopped;
  }
  // #endregion

  // #region Dispatch stuff
  protected isDispatching = false;

  protected dispatchQueue: Action[] = [];

  protected handleAction(action: Action) {
    const target = this.getRealm(action.target);

    this.transactionManager.begin();
    target.executeAction(action.key, action.payload);
    this.transactionManager.commit();

    if (action.callback) {
      action.callback();
    }
  }

  dispatch(action: Action, nextActions?: Action[]): void {
    // Enqueue anction and nextActions when needed
    if (this.isDispatching) {
      this.dispatchQueue.push(action);
    }
    if (nextActions !== undefined && nextActions.length > 0) {
      this.dispatchQueue.push(...nextActions);
    }
    // --------------------------------------------

    if (this.isDispatching) {
      return;
    }

    this.isDispatching = true;

    this.handleAction(action);

    while (this.dispatchQueue.length > 0) {
      const nextAction = this.dispatchQueue.shift()!;
      this.handleAction(nextAction);
    }

    this.isDispatching = false;
  }

  multiDispatch(actions: Action[]): void {
    if (actions.length > 0) {
      const [action, ...nextActions] = actions;
      this.dispatch(action, nextActions);
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

  mountBranches(junctures: (Juncture | BranchConfig)[]): string[] {
    const configs = junctures.map(request => {
      let config: BranchConfig;
      if (typeof request === 'function') {
        config = { juncture: request };
      } else {
        config = request;
      }
      return config;
    });

    return this.branchManager.mountBranches(configs);
  }

  unmountBranch(id: string) {
    this.branchManager.unmountBranches([id]);
  }

  unmountBranches(ids: string[]) {
    this.branchManager.unmountBranches(ids);
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
    const branchId = path[0];
    if (typeof branchId !== 'string') {
      // eslint-disable-next-line max-len
      throw Error(`Cannot resolve path ${pathToString(path)}: Invalid branch id type (${typeof branchId}), must be a string`);
    }
    const realm = this.branchManager.getBranch(path[0] as string);
    if (realm === undefined) {
      throw Error(`Cannot resolve path ${pathToString(path)}: Branch "${typeof branchId}" not mounted`);
    }
    let result = realm;
    for (let i = 1; i < pathLen; i += 1) {
      result = result.getChildRealm(path[i]);
    }
    return result;
  }

  // TODO: Implement this
  protected getXpCursorFromQueryItem(item: QueryItem): Cursor | undefined {
    const request = typeof item === 'function' ? item : item.get;
    if (request) {
      if (isJuncture(request)) {
        const ids = this.branchManager.branchIds;
        for (let i = 0; i < ids.length; i += 1) {
          const realm = this.branchManager.getBranch(ids[i]);
          if (realm?.driver.constructor === request) {
            return realm.xpCursor;
          }
        }
      }
      if (typeof request === 'string') {
        const realm = this.branchManager.getBranch(request);
        if (realm) {
          return realm.xpCursor;
        }
      }
    }

    // throw Error('Unable to find a frame for the specified QueryItem');
    return undefined;
  }

  createFrame<Q extends Query>(query: Q): QueryFrame<Q> {
    const keys = Object.keys(query);
    const cursor = mappedAssign({}, keys, key => this.getXpCursorFromQueryItem(query[key]));
    return createUnboundFrame(cursor);
  }

  createAciveFrameHandler<Q extends ActiveQuery>(query: Q): ActiveQueryFrameHandler<Q> {
    return this.activeQueryManager.createHandler(query);
  }
  // #endregion
}
