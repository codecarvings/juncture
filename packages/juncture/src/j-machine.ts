/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Action } from './engine/action';
import { Frame } from './engine/frames/frame';
import { Gear, GearLayout, GearMediator } from './engine/gear';
import { getGear, isGearHost } from './engine/gear-host';
import { Juncture, JunctureType, ValueOfType } from './juncture';

export enum JMachineStatus {
  running = 'running',
  stopped = 'stopped'
}

export class JMachine<JT extends JunctureType> {
  constructor(readonly Type: JT, value?: ValueOfType<JT>) {
    this.dispatch = this.dispatch.bind(this);

    this._value = this.getInitialValue(value);

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
  protected readonly gear: Gear;

  protected gearUnmount: () => void = undefined!;

  protected createGear(): Gear {
    const layout: GearLayout = {
      path: [],
      parent: null,
      isUnivocal: true,
      isDivergent: false
    };
    const mediator: GearMediator = {
      enroll: um => { this.gearUnmount = um; },
      getValue: () => this._value,
      setValue: newValue => {
        // New Value check performed in Gear.executeAction method
        this._value = newValue;
        this.gear.detectValueChange();
      },
      dispatch: this.dispatch
    };

    return Juncture.createGear(this.Type, layout, mediator);
  }

  get status(): JMachineStatus {
    return this.gear.isMounted ? JMachineStatus.running : JMachineStatus.stopped;
  }

  stop() {
    if (this.status === JMachineStatus.stopped) {
      throw Error('JMachine already stopped');
    }

    this.gearUnmount();
  }
  // #endregion

  // eslint-disable-next-line class-methods-use-this
  dispatch(action: Action) {
    // TODO: Implement this
    if (isGearHost(action.target)) {
      const gear = getGear(action.target);
      gear.executeAction(action.key, action.args);
    }
  }

  // TODO: Implement getFrame and remove static frame...
  readonly frame: Frame<InstanceType<JT>>;
}
