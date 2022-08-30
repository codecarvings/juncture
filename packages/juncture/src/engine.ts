/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, ValueOfJuncture } from './juncture';
import { Action } from './operation/action';
import { OuterFrame } from './operation/frames/outer-frame';
import { Path } from './operation/path';
import {
  ControlledRealm, ManagedRealm, Realm, RealmLayout, RealmMediator, RealmMountStatus
} from './operation/realm';
import { getRealm, isRealmHost } from './operation/realm-host';
import { RealmManager } from './operation/realm-manager';
import { TransactionManager } from './operation/transaction-manager';
import { ValueUsageMonitor } from './operation/value-usage-monitor';

export enum EngineStatus {
  initializing = 'initializing',
  running = 'running',
  stopped = 'stopped'
}

export interface EngineRealmMediator {
  readonly realm: {
    enroll(managedRealm: ManagedRealm): void
    createControlled(Juncture: Juncture, layout: RealmLayout, realmMediator: RealmMediator): ControlledRealm;
  };

  readonly selection: {
    registerValueUsage(path: Path): void;
  }

  readonly reaction: {
    dispatch(action: Action): void;
    registerAlteredRealm(realm: Realm): void;
  };
}

export class Engine<J extends Juncture> {
  constructor(readonly Juncture: J, value?: ValueOfJuncture<J>) {
    this.dispatch = this.dispatch.bind(this);

    this._value = this.getInitialValue(value);

    this.realmManager = this.createRealmManger();

    this.valueUsageMonitor = this.createValueUsageMonitor();

    this.transactionManager = this.createTransactionManager();

    this.realm = this.createRealm();

    this.realmManager.sync();

    this.frame = this.realm.outerFrame as any;
  }

  // #region Value stuff
  protected _value: ValueOfJuncture<J>;

  get value(): ValueOfJuncture<J> {
    return this._value;
  }

  protected getInitialValue(value?: ValueOfJuncture<J>) {
    const schema = Juncture.getSchema(this.Juncture);
    return value === undefined ? schema.defaultValue : value;
  }
  // #endregion

  // #region Mount stuff

  protected readonly realmManager: RealmManager;

  // eslint-disable-next-line class-methods-use-this
  protected createRealmManger(): RealmManager {
    return new RealmManager();
  }

  readonly valueUsageMonitor: ValueUsageMonitor;

  // eslint-disable-next-line class-methods-use-this
  protected createValueUsageMonitor(): ValueUsageMonitor {
    return new ValueUsageMonitor();
  }

  protected readonly transactionManager: TransactionManager;

  protected createTransactionManager(): TransactionManager {
    return new TransactionManager(this.realmManager.sync);
  }

  protected readonly realm: Realm;

  protected createRealm(): Realm {
    const layout: RealmLayout = {
      path: [],
      parent: null,
      isUnivocal: true,
      isDivergent: false
    };
    const realmMediator: RealmMediator = {
      getValue: () => this._value,
      setValue: newValue => {
        this._value = newValue;
      }
    };
    const engineMediator: EngineRealmMediator = {
      realm: {
        enroll: this.realmManager.enroll,
        createControlled: (Juncture2, layout2, realmMediator2) => {
          const realm = Juncture.createRealm(Juncture2, layout2, realmMediator2, engineMediator);
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

    return Juncture.createRealm(this.Juncture, layout, realmMediator, engineMediator);
  }

  get status(): EngineStatus {
    switch (this.realm.mountStatus) {
      case RealmMountStatus.mounted:
        return EngineStatus.running;
      case RealmMountStatus.unmounted:
        return EngineStatus.stopped;
      default:
        return EngineStatus.initializing;
    }
  }

  stop() {
    if (this.status === EngineStatus.stopped) {
      throw Error('Engine already stopped');
    }

    this.realmManager.dismiss(this.realm);
    this.realmManager.sync();
  }
  // #endregion

  // #region Frame stuff
  dispatch(action: Action) {
    let target: Realm;
    if (isRealmHost(action.target)) {
      // RealmRef
      target = getRealm(action.target);
      if (target.mountStatus === RealmMountStatus.unmounted) {
        // Aready unmounted, try to resolve the path
        target = this.realm.resolve(action.target);
      }
    } else {
      target = this.realm.resolve(action.target);
    }

    this.transactionManager.begin();
    target.executeAction(action.key, action.payload);
    this.transactionManager.commit();

    if (action.callback) {
      action.callback();
    }
  }

  // TODO: Implement getFrame and remove static frame...
  readonly frame: OuterFrame<InstanceType<J>>;
  // #endregion
}
