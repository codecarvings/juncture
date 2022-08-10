/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { JunctureSchema } from '../design/schema';
import { Juncture } from '../juncture';
import { defineLazyProperty } from '../tool/object';
import { Action } from './action';
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

export interface GearController {
  mount(): void;
  unmount(): void;
}

export interface GearMediator {
  enroll(controller: GearController): void;
  getValue(): any;
  setValue(newValue: any): void;
  dispatch(action: Action): void;
}

// #endregion

// #region Gear
const revocablePropOptions = { configurable: true };

export class Gear {
  readonly schema: JunctureSchema;

  readonly ref!: GearRef;

  constructor(readonly juncture: Juncture, readonly layout: GearLayout, protected readonly mediator: GearMediator) {
    this.schema = Juncture.getSchema(juncture);

    defineLazyProperty(this, 'ref', () => createGearRef(this));

    this._value = mediator.getValue();
    Object.defineProperty(this, 'value', {
      get: () => this._value,
      ...revocablePropOptions
    });

    this.core = this.createCore();
    defineLazyProperty(this, 'cursor', () => this.core.cursor, revocablePropOptions);
    defineLazyProperty(this, 'frame', () => this.core.frame, revocablePropOptions);
    defineLazyProperty(this, 'bins', () => this.core.bins, revocablePropOptions);

    mediator.enroll({
      mount: () => {
        if (this._isMounted) {
          throw Error(`Cannot mount Gear ${pathToString(this.layout.path)}: already mounted`);
        }
        this._isMounted = true;
        this.gearDidMount();
      },
      unmount: () => {
        if (this._isMounted === false) {
          throw Error(`Cannot unmount Gear ${pathToString(this.layout.path)}: already unmounted`);
        }
        if (this._isMounted !== true) {
          throw Error(`Cannot unmount Gear ${pathToString(this.layout.path)}: not mounted`);
        }
        this.gearWillUnmount();
        this._isMounted = false;
      }
    });
  }

  // #region Core stuff
  protected readonly core: Core;

  protected createCore(): Core {
    return new Core(this, this.mediator);
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
      this.mediator.setValue(value);
    }
  }

  detectValueChange() {
    const value = this.mediator.getValue();
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
  protected _isMounted: boolean = undefined!;

  get isMounted(): boolean {
    return this._isMounted;
  }

  // eslint-disable-next-line class-methods-use-this
  protected gearDidMount(): void {
  }

  protected gearWillUnmount(): void {
    const getRevoked = (desc: string) => () => {
      throw Error(`Cannot access ${desc}: Gear ${pathToString(this.layout.path)} not mounted`);
    };

    const mediatorKeys = Object.keys(this.mediator);
    mediatorKeys.forEach(key => {
      defineLazyProperty(this.mediator, key, getRevoked(`mediator.${key}`));
    });

    defineLazyProperty(this, 'value', getRevoked('value'));
    defineLazyProperty(this, 'cursor', getRevoked('cursor'));
    defineLazyProperty(this, 'frame', getRevoked('frame'));
    defineLazyProperty(this, 'bins', getRevoked('bins'));
  }
  // #endregion
}

// #endregion

// #region MaagedGear
export interface ManagedGear<G extends Gear = Gear> {
  readonly gear: G;
  readonly controller: GearController;
}

export interface ManagedGearMap {
  readonly [key: string]: ManagedGear;
}
// #endregion
