/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { JunctureSchema } from '../design/schema';
import { JMachineGearMediator } from '../j-machine';
import { Juncture } from '../juncture';
import { defineLazyProperty } from '../tool/object';
import { Core } from './core';
import { Cursor } from './cursor';
import { Frame } from './frames/frame';
import { createGearRef, GearRef } from './gear-ref';
import {
  BinKit
} from './kits/bin-kit';
import {
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

  constructor(
    readonly juncture: Juncture,
    readonly layout: GearLayout,
    protected readonly gearMediator: GearMediator,
    protected readonly machineMediator: JMachineGearMediator
  ) {
    this.schema = Juncture.getSchema(juncture);

    defineLazyProperty(this, 'ref', () => createGearRef(this));

    this._value = gearMediator.getValue();
    Object.defineProperty(this, 'value', {
      get: () => this._value,
      ...revocablePropOptions
    });

    this.core = this.createCore();
    defineLazyProperty(this, 'cursor', () => this.core.cursor, revocablePropOptions);
    defineLazyProperty(this, 'frame', () => this.core.frame, revocablePropOptions);
    defineLazyProperty(this, 'bins', () => this.core.bins, revocablePropOptions);

    this.ensureMountStatus = this.ensureMountStatus.bind(this);
    machineMediator.enrollGear(this.createManagedGear());
  }

  // #region Core stuff
  protected readonly core: Core;

  protected createCore(): Core {
    return new Core(this, this.machineMediator);
  }

  readonly cursor!: Cursor;

  readonly frame!: Frame;

  readonly bins!: BinKit;
  // #endregion

  // #region Value stuff
  protected _value: any;

  readonly value!: any;

  // eslint-disable-next-line class-methods-use-this
  protected valueDidUpdate(): void { }

  // eslint-disable-next-line class-methods-use-this
  getHarmonizedValue(value: any): any {
    return value;
  }

  executeAction(key: string, args: any) {
    const reducerFn = (this.core.internalBins.reduce as any)[key];
    if (!reducerFn) {
      throw Error(`Unable to execute action "${key}": not a Reducer`);
    }

    const value = reducerFn(...args);

    if (value !== this._value) {
      this.gearMediator.setValue(value);
    }
  }

  detectValueChange() {
    const value = this.gearMediator.getValue();
    if (value === this._value) {
      return;
    }

    this._value = value;
    this.valueDidUpdate();
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
  private ensureMountStatus(desc: string, expected: GearMountStatus) {
    if (this._mountStatus !== expected) {
      throw Error(`Cannot ${desc} Gear ${pathToString(this.layout.path)}: current mount status: ${this._mountStatus}`);
    }
  }

  protected createManagedGear(): ManagedGear {
    return {
      gear: this,
      mount: () => {
        this.ensureMountStatus('mount', GearMountStatus.pending);
        this._mountStatus = GearMountStatus.mounted;
        this.gearDidMount();
      },
      unmount: () => {
        this.ensureMountStatus('unmount', GearMountStatus.mounted);
        this.gearWillUnmount();
        this._mountStatus = GearMountStatus.unmounted;
      }
    };
  }

  protected _mountStatus: GearMountStatus = GearMountStatus.pending;

  get mountStatus(): GearMountStatus {
    return this._mountStatus;
  }

  // eslint-disable-next-line class-methods-use-this
  protected gearDidMount(): void {
    this.core.reactors.start();
  }

  protected gearWillUnmount(): void {
    this.core.reactors.stop();

    const getRevoked = (desc: string) => () => {
      throw Error(`Cannot access ${desc}: Gear ${pathToString(this.layout.path)} not mounted`);
    };

    const mediatorKeys = Object.keys(this.gearMediator);
    mediatorKeys.forEach(key => {
      defineLazyProperty(this.gearMediator, key, getRevoked(`mediator.${key}`));
    });

    defineLazyProperty(this, 'value', getRevoked('value'));
    defineLazyProperty(this, 'cursor', getRevoked('cursor'));
    defineLazyProperty(this, 'frame', getRevoked('frame'));
    defineLazyProperty(this, 'bins', getRevoked('bins'));
  }
  // #endregion
}

export interface GearMap {
  readonly [key: string]: Gear;
}
// #endregion
