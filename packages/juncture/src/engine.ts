/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ActiveQueryFrameHandler, ActiveQueryManager } from './engine-parts/active-query-manager';
import { PersistentPathManager } from './engine-parts/persistent-path-manager';
import { RealmManager } from './engine-parts/realm-manager';
import { ServiceConfig, ServiceManager } from './engine-parts/service-manager';
import { TransactionManager } from './engine-parts/transaction-manager';
import { ValueUsageRecorder } from './engine-parts/value-usage-recorder';
import { isJuncture, Juncture } from './juncture';
import { Action } from './operation/action';
import { Cursor } from './operation/frame-equipment/cursor';
import { QueryFrame } from './operation/frames/query-frame';
import { createUnboundFrame } from './operation/frames/unbound-frame';
import { Path, pathToString, PersistentPath } from './operation/path';
import {
  ControlledRealm, ManagedRealm, Realm, RealmLayout, RealmMediator, RealmMountCondition
} from './operation/realm';
import { getRealm, isRealmHost } from './operation/realm-host';
import { ActiveQuery } from './query/active-query';
import { Query, QueryItem } from './query/query';
import { mappedAssign } from './utilities/object';

export enum EngineCondition {
  ready = 'ready',
  stopping = 'stopping',
  stopped = 'stopped'
}

export interface EngineConditionHolder {
  readonly current: EngineCondition;
}

export interface EngineRealmMediator {
  readonly persistentPath: {
    get(path: Path): PersistentPath;
    releaseRequirement(path: PersistentPath): void;
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
    this.startServices = this.startServices.bind(this);
    this.stopServices = this.stopServices.bind(this);
    this.getXpCursorFromQueryItem = this.getXpCursorFromQueryItem.bind(this);

    this.persistentPathManager = this.createPersistentPathManager();
    this.realmManager = this.createRealmManger();
    this.valueUsageRecorder = this.createValueUsageRecorder();
    this.transactionManager = this.createTransactionManager();
    this.serviceManager = this.createServiceManager();
    this.activeQueryManager = this.createActiveQueryManager();
  }

  protected readonly state = new Map<string, any>();

  getState(): any {
    const result: any = {};
    this.state.forEach((value, key) => {
      result[key] = value;
    });
    return result;
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

  protected readonly valueUsageRecorder: ValueUsageRecorder;

  // eslint-disable-next-line class-methods-use-this
  protected createValueUsageRecorder(): ValueUsageRecorder {
    return new ValueUsageRecorder();
  }

  protected readonly transactionManager: TransactionManager;

  protected createTransactionManager(): TransactionManager {
    return new TransactionManager(this.realmManager.syncMount);
  }

  protected readonly serviceManager: ServiceManager;

  protected createServiceManager(): ServiceManager {
    const engineRealmMediator: EngineRealmMediator = {
      persistentPath: {
        get: this.persistentPathManager.getPersistentPath,
        releaseRequirement: this.persistentPathManager.releaseRequirement
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

    return new ServiceManager(this.state, this.realmManager.dismiss, this.realmManager.syncMount, engineRealmMediator);
  }

  protected readonly activeQueryManager: ActiveQueryManager;

  protected createActiveQueryManager(): ActiveQueryManager {
    return new ActiveQueryManager(
      this.startServices,
      this.stopServices,
      this.getXpCursorFromQueryItem,
      this.valueUsageRecorder.useCassette,
      this.valueUsageRecorder.ejectCassette,
      this.transactionManager.valueMutationAck$
    );
  }
  // #endregion

  // #region Condition stuff
  // An holder that can be passed to engine-parts that require it
  protected _condition = {
    current: EngineCondition.ready
  };

  get condition(): EngineCondition {
    return this._condition.current;
  }

  stop() {
    if (this.condition !== EngineCondition.ready) {
      throw Error('Cannot stop engine: not ready');
    }

    this._condition.current = EngineCondition.stopping;

    this.activeQueryManager.stop();
    this.transactionManager.stop();
    this.serviceManager.stop();
    this.realmManager.stop();

    this._condition.current = EngineCondition.stopped;
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

  // #region Service stuff
  startService<J extends Juncture>(juncture: J): string;
  startService<J extends Juncture>(config: ServiceConfig<J>): string;
  startService(juncture_or_config: Juncture | ServiceConfig) {
    let config: ServiceConfig;
    if (typeof juncture_or_config === 'function') {
      config = { juncture: juncture_or_config };
    } else {
      config = juncture_or_config;
    }
    return this.serviceManager.startServices([config])[0];
  }

  startServices(junctures: (Juncture | ServiceConfig)[]): string[] {
    const configs = junctures.map(request => {
      let config: ServiceConfig;
      if (typeof request === 'function') {
        config = { juncture: request };
      } else {
        config = request;
      }
      return config;
    });

    return this.serviceManager.startServices(configs);
  }

  stopService(id: string) {
    this.serviceManager.stopServices([id]);
  }

  stopServices(ids: string[]) {
    this.serviceManager.stopServices(ids);
  }

  protected getRealm(path: Path): Realm {
    if (isRealmHost(path)) {
      const result = getRealm(path);
      if (result.mountCondition !== RealmMountCondition.unmounted) {
        return result;
      }
    }

    const pathLen = path.length;
    if (pathLen === 0) {
      throw Error('Cannot resolve empty path []');
    }
    const serviceId = path[0];
    if (typeof serviceId !== 'string') {
      // eslint-disable-next-line max-len
      throw Error(`Cannot resolve path ${pathToString(path)}: Invalid service id type (${typeof serviceId}), must be a string`);
    }
    const realm = this.serviceManager.getService(path[0] as string);
    if (realm === undefined) {
      throw Error(`Cannot resolve path ${pathToString(path)}: Service "${typeof serviceId}" not started`);
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
        const ids = this.serviceManager.serviceIds;
        for (let i = 0; i < ids.length; i += 1) {
          const realm = this.serviceManager.getService(ids[i]);
          if (realm?.driver.constructor === request) {
            return realm.xpCursor;
          }
        }
      }
      if (typeof request === 'string') {
        const realm = this.serviceManager.getService(request);
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
