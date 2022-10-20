/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { DescriptorType } from '../design/descriptor-type';
import { Driver } from '../driver';
import { EngineRealmMediator } from '../engine';
import { Juncture } from '../juncture';
import { junctureSymbols } from '../juncture-symbols';
import { JunctureSchema } from '../schema';
import { Setup } from '../setup';
import { defineLazyProperty } from '../utilities/object';
import { Core } from './core';
import { Cursor } from './frame-equipment/cursor';
import { Instruction } from './instruction';
import { XpBinKit } from './kits/bin-kit';
import {
  comparePaths, PathFragment, pathFragmentToString, pathToString, PersistentPath
} from './path';
import { createRealmRef, RealmRef } from './realm-ref';

// #region Support types
export interface RealmLayout {
  readonly path: PersistentPath;
  readonly parent: Realm | null;
  readonly isUnivocal: boolean;
  readonly isDivergent: boolean;
}

export interface RealmMediator {
  getValue(): any;
  setValue(newValue: any): void;
}

export enum RealmMountCondition {
  pending = 'pending',
  mounted = 'mounted',
  unmounted = 'unmounted'
}

export interface ManagedRealm {
  readonly realm: Realm;
  mount(): void;
  unmount(): void;
}
// #endregion

// #region Realm
const revocablePropOptions = { configurable: true };

export class Realm {
  readonly ref!: RealmRef;

  readonly schema: JunctureSchema;

  readonly setup: Setup;

  constructor(
    readonly driver: Driver,
    readonly layout: RealmLayout,
    protected readonly realmMediator: RealmMediator,
    protected readonly engineMediator: EngineRealmMediator
  ) {
    defineLazyProperty(this, 'ref', () => createRealmRef(this));

    this.schema = Juncture.getSchema(driver);
    this.setup = Juncture.getSetup(driver);

    const { registerValueUsage } = engineMediator.selection;
    const { path } = layout;
    this._value = realmMediator.getValue();
    Object.defineProperty(this, 'value', {
      get: () => {
        registerValueUsage(path);
        return this._value;
      },
      ...revocablePropOptions
    });

    this.core = this.createCore();
    defineLazyProperty(this, 'xpCursor', () => this.core.xpCursor, revocablePropOptions);
    defineLazyProperty(this, 'xpBins', () => this.core.xpBins, revocablePropOptions);

    engineMediator.realm.enroll(this.createManagedRealm());
  }

  // #region Core stuff
  protected readonly core: Core;

  protected createCore(): Core {
    return new Core(this, this.engineMediator.reaction);
  }

  readonly xpCursor!: Cursor;

  readonly xpBins!: XpBinKit;
  // #endregion

  // #region Value stuff

  protected _value: any;

  readonly value!: any;

  detectValueChange(): boolean {
    const value = this.realmMediator.getValue();
    if (value === this._value) {
      return false;
    }

    this.engineMediator.reaction.registerAlteredRealm(this);

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
      if (value !== this._value) {
        this.realmMediator.setValue(value);
        this.detectValueChange();
      }
    } else {
      const desc = this.setup.reactors.map[key];
      if (desc) {
        if (desc.type === DescriptorType.reactor) {
          const value = this.getHarmonizedValue(desc[junctureSymbols.payload](this.core.frames.default)(...payload));
          if (value !== this._value) {
            this.realmMediator.setValue(value);
            this.detectValueChange();
          }
        } else {
          // SyntReactor
          // eslint-disable-next-line @typescript-eslint/naming-convention
          const instruction_or_instructions = desc[junctureSymbols.payload](this.core.frames.synthReactor)(...payload);
          if (Array.isArray(instruction_or_instructions)) {
            (instruction_or_instructions as Instruction[]).forEach(instruction => {
              if (comparePaths(this.layout.path, instruction.target.layout.path) < 0) {
                throw Error(`Realm ${pathToString(this.layout.path)} cannot execute instruction ${pathToString(instruction.target.layout.path)}: out of scope`);
              }
              instruction.target.excuteInstruction(instruction.key, instruction.payload);
            });
          } else {
            const instruction = (instruction_or_instructions as Instruction);
            if (comparePaths(this.layout.path, instruction.target.layout.path) < 0) {
              throw Error(`Realm ${pathToString(this.layout.path)} cannot execute instruction ${pathToString(instruction.target.layout.path)}: out of scope`);
            }
            instruction.target.excuteInstruction(instruction.key, instruction.payload);
          }
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
  getChildRealm(fragment: PathFragment): Realm {
    throw Error(`Realm ${pathToString(this.layout.path)} cannot resolve path fragment: ${pathFragmentToString(fragment)}`);
  }
  // #endregion

  // #region Mount stuff
  protected createManagedRealm(): ManagedRealm {
    return {
      realm: this,
      mount: () => {
        if (this._mountCondition !== RealmMountCondition.pending) {
          throw Error(`Cannot mount Realm ${pathToString(this.layout.path)}: current mount condition: ${this._mountCondition}`);
        }
        this._mountCondition = RealmMountCondition.mounted;
        this.realmDidMount();
      },
      unmount: () => {
        if (this._mountCondition !== RealmMountCondition.mounted && this._mountCondition !== RealmMountCondition.pending) {
          throw Error(`Cannot unmount Realm ${pathToString(this.layout.path)}: current mount condition: ${this._mountCondition}`);
        }
        this.realmWillUnmount();
        this._mountCondition = RealmMountCondition.unmounted;
      }
    };
  }

  protected _mountCondition: RealmMountCondition = RealmMountCondition.pending;

  get mountCondition(): RealmMountCondition {
    return this._mountCondition;
  }

  protected realmDidMount(): void {
    this.core.behaviors.start();
  }

  protected realmWillUnmount(): void {
    if (this.core.behaviors.started) {
      this.core.behaviors.stop();
    }
    this.engineMediator.persistentPath.release(this.layout.path);

    const getRevoked = (desc: string) => () => {
      throw Error(`Cannot access ${desc}: Realm ${pathToString(this.layout.path)} not mounted`);
    };

    const mediatorKeys = Object.keys(this.realmMediator);
    mediatorKeys.forEach(key => {
      defineLazyProperty(this.realmMediator, key, getRevoked(`mediator.${key}`));
    });

    defineLazyProperty(this, 'value', getRevoked('value'));
    defineLazyProperty(this, 'xpCursor', getRevoked('xpCursor'));
    defineLazyProperty(this, 'xpBins', getRevoked('xpBins'));
  }
  // #endregion
}

export interface RealmMap {
  readonly [key: string]: Realm;
}
// #endregion

// #region ControlledReealm
export interface ControlledRealm {
  readonly realm: Realm;
  scheduleUnmount(): void;
}

export interface ControlledRealmMap {
  readonly [key: string]: ControlledRealm;
}
// #endregion
