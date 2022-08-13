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
import { Juncture, JunctureType, ValueOfType } from './juncture';

export enum JMachineStatus {
  initializing = 'initializing',
  running = 'running',
  stopped = 'stopped'
}

export interface JMachineGearMediator {
  enrollGear(managedGear: ManagedGear): void
  createControlledGear(Type: JunctureType, layout: GearLayout, gearMediator: GearMediator): ControlledGear;
  dispatch(action: Action): void;
}

export class JMachine<JT extends JunctureType> {
  constructor(readonly Type: JT, value?: ValueOfType<JT>) {
    this.dispatch = this.dispatch.bind(this);

    this._value = this.getInitialValue(value);

    this.gearManager = this.createGearManger();

    this.gear = this.createGear();

    this.frame = this.gear.frame as any;
  }

  // #region Value stuff
  protected _value: ValueOfType<JT>;

  get value(): ValueOfType<JT> {
    return this._value;
  }

  protected getInitialValue(value?: ValueOfType<JT>) {
    const schema = Juncture.getSchema(this.Type);
    return value === undefined ? schema.defaultValue : value;
  }
  // #endregion

  // #region Mount stuff

  protected readonly gearManager: GearManager;

  // eslint-disable-next-line class-methods-use-this
  protected createGearManger(): GearManager {
    return new GearManager();
  }

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
        // New Value check performed in Gear.executeAction method
        this._value = newValue;
        this.gear.detectValueChange();
        this.gearManager.sync();
      }
    };
    const machineMediator: JMachineGearMediator = {
      enrollGear: this.gearManager.enrollGear,
      createControlledGear: (
        Type: JunctureType,
        layout2: GearLayout,
        gearMediator2: GearMediator
      ): ControlledGear => {
        const gear = Juncture.createGear(Type, layout2, gearMediator2, machineMediator);
        return {
          gear,
          scheduleUnmount: () => {
            this.gearManager.dismissGear(gear);
          }
        };
      },
      dispatch: this.dispatch
    };

    return Juncture.createGear(this.Type, layout, gearMediator, machineMediator);
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

    this.gearManager.dismissGear(this.gear);
    this.gearManager.sync();
  }
  // #endregion

  // #region Frame stuff
  // eslint-disable-next-line class-methods-use-this
  dispatch(action: Action) {
    let target: Gear;
    if (isGearHost(action.target)) {
      // GearRef
      target = getGear(action.target);
    } else {
      target = this.gear.resolve(action.target);
    }
    target.executeAction(action.key, action.args);
    if (action.callback) {
      action.callback();
    }
  }

  // TODO: Implement getFrame and remove static frame...
  readonly frame: Frame<InstanceType<JT>>;
  // #endregion
}
