/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { Descriptor } from '../design/descriptor';
import { DescriptorType } from '../design/descriptor-type';
import { JunctureSchema } from '../design/schema';
import { Driver } from '../driver';
import { EngineRealmMediator } from '../engine';
import { Juncture } from '../juncture';
import { jSymbols } from '../symbols';
import { defineLazyProperty } from '../tool/object';
import { Core } from './core';
import { Cursor } from './frame-equipment/cursor';
import { OuterFrame } from './frames/outer-frame';
import { Instruction } from './instruction';
import { OuterBinKit } from './kits/bin-kit';
import {
  isSameOrDescendantPath,
  Path, PathFragment, pathFragmentToString, pathToString
} from './path';
import { createRealmRef, RealmRef } from './realm-ref';

// #region Support types
export interface RealmLayout {
  readonly parent: Realm | null;
  readonly path: Path;
  readonly isUnivocal: boolean;
  readonly isDivergent: boolean;
}

export interface RealmMediator {
  getValue(): any;
  setValue(newValue: any): void;
}

export enum RealmMountStatus {
  pending = 'pending',
  mounted = 'mounted',
  unmounted = 'unmounted'
}

export interface ManagedRealm {
  readonly realm: Realm;
  mount(): void;
  unmount(): void;
}

export interface ControlledRealm {
  readonly realm: Realm;
  scheduleUnmount(): void;
}

export interface ControlledRealmMap {
  readonly [key: string]: ControlledRealm;
}

// #endregion

// #region Realm
const revocablePropOptions = { configurable: true };

export class Realm {
  readonly schema: JunctureSchema;

  readonly ref!: RealmRef;

  constructor(
    readonly driver: Driver,
    readonly layout: RealmLayout,
    protected readonly realmMediator: RealmMediator,
    protected readonly engineMediator: EngineRealmMediator
  ) {
    this.schema = Juncture.getSchema(driver);

    defineLazyProperty(this, 'ref', () => createRealmRef(this));

    this._value = realmMediator.getValue();
    Object.defineProperty(this, 'value', {
      get: () => this._value,
      ...revocablePropOptions
    });

    this.core = this.createCore();
    defineLazyProperty(this, 'outerCursor', () => this.core.outerCursor, revocablePropOptions);
    defineLazyProperty(this, 'outerFrame', () => this.core.outerFrame, revocablePropOptions);
    defineLazyProperty(this, 'outerBins', () => this.core.outerBins, revocablePropOptions);

    engineMediator.realm.enroll(this.createManagedRealm());
  }

  // #region Core stuff
  protected readonly core: Core;

  protected createCore(): Core {
    return new Core(this, this.engineMediator.action);
  }

  readonly outerCursor!: Cursor;

  readonly outerFrame!: OuterFrame;

  readonly outerBins!: OuterBinKit;
  // #endregion

  // #region Value stuff

  protected _value: any;

  readonly value!: any;

  detectValueChange(): boolean {
    const value = this.realmMediator.getValue();
    if (value === this._value) {
      return false;
    }

    this.engineMediator.transaction.registerAlteredRealm(this);
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
      this.realmMediator.setValue(value);
      this.detectValueChange();
    } else {
      const desc: Descriptor<any, any, any> = (this.driver as any)[key];
      if (desc) {
        if (desc.type === DescriptorType.reactor) {
          const value = this.getHarmonizedValue(desc[jSymbols.payload](this.core.frames.default)(...payload));
          this.realmMediator.setValue(value);
          this.detectValueChange();
        } else if (desc.type === DescriptorType.synthReactor) {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          const instruction_or_instructions = desc[jSymbols.payload](this.core.frames.synthReactor)(...payload);
          if (Array.isArray(instruction_or_instructions)) {
            (instruction_or_instructions as Instruction[]).forEach(instruction => {
              if (!isSameOrDescendantPath(this.layout.path, instruction.target.layout.path)) {
                throw Error(`Realm ${pathToString(this.layout.path)} cannot execute instruction ${pathToString(instruction.target.layout.path)}: out of scope`);
              }
              instruction.target.excuteInstruction(instruction.key, instruction.payload);
            });
          } else {
            const instruction = (instruction_or_instructions as Instruction);
            if (!isSameOrDescendantPath(this.layout.path, instruction.target.layout.path)) {
              throw Error(`Realm ${pathToString(this.layout.path)} cannot execute instruction ${pathToString(instruction.target.layout.path)}: out of scope`);
            }
            instruction.target.excuteInstruction(instruction.key, instruction.payload);
          }
        } else {
          throw Error(`Unable to execute action "${key}": wrong type (${desc.type})`);
        }
      } else {
        throw Error(`Unable to execute action "${key}": not a reactor`);
      }
    }
  }

  executeAction(key: string, payload: any) {
    if (typeof key !== 'string') {
      throw Error(`Unable to execute action: invalid key "${key}"`);
    }

    this.excuteInstruction(key, payload);
  }

  // #endregion

  // #region Children stuff
  resolve(path: Path): Realm {
    if (path.length === 0) {
      return this;
    }

    const [fragment, ...next] = path;
    const child = this.resolveFragment(fragment);
    return child.resolve(next);
  }

  resolveFragment(fragment: PathFragment): Realm {
    throw Error(`Realm ${pathToString(this.layout.path)} cannot resolve path fragment: ${pathFragmentToString(fragment)}`);
  }
  // #endregion

  // #region Mount stuff
  protected createManagedRealm(): ManagedRealm {
    return {
      realm: this,
      mount: () => {
        if (this._mountStatus !== RealmMountStatus.pending) {
          throw Error(`Cannot mount Realm ${pathToString(this.layout.path)}: current mount status: ${this._mountStatus}`);
        }
        this._mountStatus = RealmMountStatus.mounted;
        this.realmDidMount();
      },
      unmount: () => {
        if (this._mountStatus !== RealmMountStatus.mounted && this._mountStatus !== RealmMountStatus.pending) {
          throw Error(`Cannot unmount Realm ${pathToString(this.layout.path)}: current mount status: ${this._mountStatus}`);
        }
        this.realmWillUnmount();
        this._mountStatus = RealmMountStatus.unmounted;
      }
    };
  }

  protected _mountStatus: RealmMountStatus = RealmMountStatus.pending;

  get mountStatus(): RealmMountStatus {
    return this._mountStatus;
  }

  protected realmDidMount(): void {
    this.core.behaviors.start();
  }

  protected realmWillUnmount(): void {
    if (this.core.behaviors.started) {
      this.core.behaviors.stop();
    }

    const getRevoked = (desc: string) => () => {
      throw Error(`Cannot access ${desc}: Realm ${pathToString(this.layout.path)} not mounted`);
    };

    const mediatorKeys = Object.keys(this.realmMediator);
    mediatorKeys.forEach(key => {
      defineLazyProperty(this.realmMediator, key, getRevoked(`mediator.${key}`));
    });

    defineLazyProperty(this, 'value', getRevoked('value'));
    defineLazyProperty(this, 'outerCursor', getRevoked('outerCursor'));
    defineLazyProperty(this, 'outerFrame', getRevoked('outerFrame'));
    defineLazyProperty(this, 'outerBins', getRevoked('outerBins'));
  }
  // #endregion
}

export interface RealmMap {
  readonly [key: string]: Realm;
}
// #endregion
