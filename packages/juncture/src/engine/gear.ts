/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { Descriptor, getFilteredDescriptorKeys } from '../design/descriptor';
import { applicableDescriptorTypes, DescriptorType } from '../design/descriptor-type';
import { JunctureSchema } from '../design/schema';
import { Driver } from '../driver';
import { JMachineGearMediator } from '../j-machine';
import { Juncture } from '../juncture';
import { jSymbols } from '../symbols';
import { defineLazyProperty } from '../tool/object';
import { Core } from './core';
import { Cursor } from './frame-equipment/cursor';
import { OuterFrame } from './frames/outer-frame';
import { createGearRef, GearRef } from './gear-ref';
import { Instruction } from './instruction';
import { OuterBinKit } from './kits/bin-kit';
import {
  isSameOrDescendantPath,
  Path, PathFragment, pathFragmentToString, pathToString
} from './path';

// #region Support types
export interface GearLayout {
  readonly parent: Gear | null;
  readonly path: Path;
  readonly isUnivocal: boolean;
  readonly isDivergent: boolean;
}

export interface GearMediator {
  getValue(): any;
  setValue(newValue: any): void;
}

export enum GearMountStatus {
  pending = 'pending',
  mounted = 'mounted',
  unmounted = 'unmounted'
}

export interface ManagedGear {
  readonly gear: Gear;
  mount(): void;
  unmount(): void;
}

export interface ControlledGear {
  readonly gear: Gear;
  scheduleUnmount(): void;
}

export interface ControlledGearMap {
  readonly [key: string]: ControlledGear;
}

// #endregion

// #region Gear
const revocablePropOptions = { configurable: true };

export class Gear {
  readonly schema: JunctureSchema;

  readonly ref!: GearRef;

  protected readonly applicableKeys!: string;

  constructor(
    readonly driver: Driver,
    readonly layout: GearLayout,
    protected readonly gearMediator: GearMediator,
    protected readonly machineMediator: JMachineGearMediator
  ) {
    this.schema = Juncture.getSchema(driver);

    defineLazyProperty(this, 'ref', () => createGearRef(this));

    defineLazyProperty(this, 'applicableKeys', () => getFilteredDescriptorKeys(driver, applicableDescriptorTypes, true));

    this._value = gearMediator.getValue();
    Object.defineProperty(this, 'value', {
      get: () => this._value,
      ...revocablePropOptions
    });

    this.core = this.createCore();
    defineLazyProperty(this, 'outerCursor', () => this.core.outerCursor, revocablePropOptions);
    defineLazyProperty(this, 'outerFrame', () => this.core.outerFrame, revocablePropOptions);
    defineLazyProperty(this, 'outerBins', () => this.core.outerBins, revocablePropOptions);

    machineMediator.gear.enroll(this.createManagedGear());
  }

  // #region Core stuff
  protected readonly core: Core;

  protected createCore(): Core {
    return new Core(this, this.machineMediator);
  }

  readonly outerCursor!: Cursor;

  readonly outerFrame!: OuterFrame;

  readonly outerBins!: OuterBinKit;
  // #endregion

  // #region Value stuff

  protected _value: any;

  readonly value!: any;

  detectValueChange(): boolean {
    const value = this.gearMediator.getValue();
    if (value === this._value) {
      return false;
    }

    this.machineMediator.transaction.registerAlteredGear(this);
    this._value = value;
    this.valueDidUpdate();
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected valueDidUpdate(): void { }

  // eslint-disable-next-line class-methods-use-this
  protected getHarmonizedValue(value: any): any {
    return value;
  }

  protected excuteInstruction(key: string | undefined, payload: any) {
    if (key === undefined) {
      // Set instruction
      const value = this.getHarmonizedValue(payload);
      this.gearMediator.setValue(value);
      this.detectValueChange();
    } else {
      const desc: Descriptor<any, any, any> = (this.driver as any)[key];
      if (desc) {
        if (desc.type === DescriptorType.reducer) {
          const value = this.getHarmonizedValue(desc[jSymbols.payload](this.core.frames.default)(...payload));
          this.gearMediator.setValue(value);
          this.detectValueChange();
        } else if (desc.type === DescriptorType.trigger) {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          const instruction_or_instructions = desc[jSymbols.payload](this.core.frames.trigger)(...payload);
          if (Array.isArray(instruction_or_instructions)) {
            (instruction_or_instructions as Instruction[]).forEach(instruction => {
              if (!isSameOrDescendantPath(this.layout.path, instruction.target.layout.path)) {
                throw Error(`Gear ${pathToString(this.layout.path)} cannot execute instruction ${pathToString(instruction.target.layout.path)}: out of scope`);
              }
              instruction.target.excuteInstruction(instruction.key, instruction.payload);
            });
          } else {
            const instruction = (instruction_or_instructions as Instruction);
            if (!isSameOrDescendantPath(this.layout.path, instruction.target.layout.path)) {
              throw Error(`Gear ${pathToString(this.layout.path)} cannot execute instruction ${pathToString(instruction.target.layout.path)}: out of scope`);
            }
            instruction.target.excuteInstruction(instruction.key, instruction.payload);
          }
        } else {
          throw Error(`Unable to execute action "${key}": wrong type (${desc.type})`);
        }
      } else {
        throw Error(`Unable to execute action "${key}": not a Reducer or a Trigger`);
      }
    }
  }

  executeAction(key: string, payload: any) {
    if (typeof key !== 'string') {
      throw Error(`Unable to execute action: invalid key "${key}"`);
    }

    this.machineMediator.transaction.begin();
    this.excuteInstruction(key, payload);
    this.machineMediator.transaction.commit();
  }

  // #endregion

  // #region Children stuff
  resolve(path: Path): Gear {
    if (path.length === 0) {
      return this;
    }

    const [fragment, ...next] = path;
    const child = this.resolveFragment(fragment);
    return child.resolve(next);
  }

  resolveFragment(fragment: PathFragment): Gear {
    throw Error(`Gear ${pathToString(this.layout.path)} cannot resolve path fragment: ${pathFragmentToString(fragment)}`);
  }
  // #endregion

  // #region Mount stuff
  protected createManagedGear(): ManagedGear {
    return {
      gear: this,
      mount: () => {
        if (this._mountStatus !== GearMountStatus.pending) {
          throw Error(`Cannot mount Gear ${pathToString(this.layout.path)}: current mount status: ${this._mountStatus}`);
        }
        this._mountStatus = GearMountStatus.mounted;
        this.gearDidMount();
      },
      unmount: () => {
        if (this._mountStatus !== GearMountStatus.mounted && this._mountStatus !== GearMountStatus.pending) {
          throw Error(`Cannot unmount Gear ${pathToString(this.layout.path)}: current mount status: ${this._mountStatus}`);
        }
        this.gearWillUnmount();
        this._mountStatus = GearMountStatus.unmounted;
      }
    };
  }

  protected _mountStatus: GearMountStatus = GearMountStatus.pending;

  get mountStatus(): GearMountStatus {
    return this._mountStatus;
  }

  protected gearDidMount(): void {
    this.core.reactors.start();
  }

  protected gearWillUnmount(): void {
    if (this.core.reactors.started) {
      this.core.reactors.stop();
    }

    const getRevoked = (desc: string) => () => {
      throw Error(`Cannot access ${desc}: Gear ${pathToString(this.layout.path)} not mounted`);
    };

    const mediatorKeys = Object.keys(this.gearMediator);
    mediatorKeys.forEach(key => {
      defineLazyProperty(this.gearMediator, key, getRevoked(`mediator.${key}`));
    });

    defineLazyProperty(this, 'value', getRevoked('value'));
    defineLazyProperty(this, 'outerCursor', getRevoked('outerCursor'));
    defineLazyProperty(this, 'outerFrame', getRevoked('outerFrame'));
    defineLazyProperty(this, 'outerBins', getRevoked('outerBins'));
  }
  // #endregion
}

export interface GearMap {
  readonly [key: string]: Gear;
}
// #endregion
