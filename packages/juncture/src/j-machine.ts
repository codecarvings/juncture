/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Action } from './engine/action';
import { Frame } from './engine/frames/frame';
import {
  ControlledGear, Gear, GearLayout, GearMediator, GearMountStatus, ManagedGear
} from './engine/gear';
import { getGear, isGearHost } from './engine/gear-host';
import { GearManager } from './engine/gear-manager';
import { TranactionManager } from './engine/transaction-manager';
import { Juncture, JunctureCtor, ValueOfCtor } from './juncture';

export enum JMachineStatus {
  initializing = 'initializing',
  running = 'running',
  stopped = 'stopped'
}

export interface JMachineGearMediator {
  readonly gear: {
    enroll(managedGear: ManagedGear): void
    createControlled(Ctor: JunctureCtor, layout: GearLayout, gearMediator: GearMediator): ControlledGear;
  }

  readonly transaction: {
    begin(): void;
    registerAlteredGear(gear: Gear): void;
    commit(): void;
  }

  dispatch(action: Action): void;
}

export class JMachine<JT extends JunctureCtor> {
  constructor(readonly Ctor: JT, value?: ValueOfCtor<JT>) {
    this.dispatch = this.dispatch.bind(this);

    this._value = this.getInitialValue(value);

    this.gearManager = this.createGearManger();

    this.transactionManager = this.createTranactionManager();

    this.gear = this.createGear();

    this.gearManager.sync();

    this.frame = this.gear.frame as any;
  }

  // #region Value stuff
  protected _value: ValueOfCtor<JT>;

  get value(): ValueOfCtor<JT> {
    return this._value;
  }

  protected getInitialValue(value?: ValueOfCtor<JT>) {
    const schema = Juncture.getSchema(this.Ctor);
    return value === undefined ? schema.defaultValue : value;
  }
  // #endregion

  // #region Mount stuff

  protected readonly gearManager: GearManager;

  // eslint-disable-next-line class-methods-use-this
  protected createGearManger(): GearManager {
    return new GearManager();
  }

  // eslint-disable-next-line class-methods-use-this
  protected createTranactionManager(): TranactionManager {
    return new TranactionManager(this.gearManager.sync);
  }

  protected readonly transactionManager: TranactionManager;

  protected readonly gear: Gear;

  protected createGear(): Gear {
    const layout: GearLayout = {
      path: [],
      parent: null,
      isUnivocal: true,
      isDivergent: false
    };
    const gearMediator: GearMediator = {
      getValue: () => this._value,
      setValue: newValue => {
        this._value = newValue;
      }
    };
    const machineMediator: JMachineGearMediator = {
      gear: {
        enroll: this.gearManager.enroll,
        createControlled: (Ctor, layout2, gearMediator2) => {
          const gear = Juncture.createGear(Ctor, layout2, gearMediator2, machineMediator);
          return {
            gear,
            scheduleUnmount: () => {
              this.gearManager.dismiss(gear);
            }
          };
        }
      },
      transaction: {
        begin: this.transactionManager.begin,
        registerAlteredGear: this.transactionManager.registerAlteredGear,
        commit: this.transactionManager.commit
      },
      dispatch: this.dispatch
    };

    return Juncture.createGear(this.Ctor, layout, gearMediator, machineMediator);
  }

  get status(): JMachineStatus {
    switch (this.gear.mountStatus) {
      case GearMountStatus.mounted:
        return JMachineStatus.running;
      case GearMountStatus.unmounted:
        return JMachineStatus.stopped;
      default:
        return JMachineStatus.initializing;
    }
  }

  stop() {
    if (this.status === JMachineStatus.stopped) {
      throw Error('JMachine already stopped');
    }

    this.gearManager.dismiss(this.gear);
    this.gearManager.sync();
  }
  // #endregion

  // #region Frame stuff
  dispatch(action: Action) {
    let target: Gear;
    if (isGearHost(action.target)) {
      // GearRef
      target = getGear(action.target);
    } else {
      target = this.gear.resolve(action.target);
    }
    target.executeAction(action.key, action.payload);
    if (action.callback) {
      action.callback();
    }
  }

  // TODO: Implement getFrame and remove static frame...
  readonly frame: Frame<InstanceType<JT>>;
  // #endregion
}
