/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Schema } from '../definition/schema';
import { Juncture } from '../juncture';
import { defineLazyProperty } from '../util/object';
import { Action } from './action';
import { CtxKernel } from './ctx-kernel';
import { createCtxRef, CtxRef } from './ctx-ref';
import { Cursor } from './cursor';
import { Frame } from './frames/frame';
import {
  BinKit
} from './kits/bin-kit';
import {
  Path, PathFragment, pathFragmentToString, pathToString
} from './path';

// #region Support types
export interface CtxLayout {
  readonly parent: Ctx | null;
  readonly path: Path;
  readonly isUnivocal: boolean;
  readonly isDivergent: boolean;
}

export interface CtxMediator {
  enroll(fn: () => void): void;
  getValue(): any;
  setValue(newValue: any): void;
  dispatch(action: Action): void;
}

// #endregion

// #region Ctx
const revocablePropOptions = { configurable: true };

export class Ctx {
  readonly schema: Schema;

  readonly ref!: CtxRef;

  constructor(readonly juncture: Juncture, readonly layout: CtxLayout, protected readonly mediator: CtxMediator) {
    this.schema = Juncture.getSchema(juncture);

    defineLazyProperty(this, 'ref', () => createCtxRef(this));

    this._value = mediator.getValue();
    Object.defineProperty(this, 'value', {
      get: () => this._value,
      ...revocablePropOptions
    });

    this.kernel = this.createKernel();
    defineLazyProperty(this, 'cursor', () => this.kernel.cursor, revocablePropOptions);
    defineLazyProperty(this, 'frame', () => this.kernel.frame, revocablePropOptions);
    defineLazyProperty(this, 'bins', () => this.kernel.bins, revocablePropOptions);

    mediator.enroll(() => {
      if (!this._isMounted) {
        throw Error(`Cannot unmount Ctx ${pathToString(this.layout.path)}: already unmounted`);
      }
      this.ctxWillUnmount();
      this._isMounted = false;
    });
  }

  // #region Kernel stuff

  protected readonly kernel: CtxKernel;

  protected createKernel(): CtxKernel {
    return new CtxKernel(this, this.mediator);
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
    const reducerFn = (this.kernel.internalBins.reduce as any)[key];
    if (!reducerFn) {
      throw Error(`Unable to execute action "${key}": not a ReducerDef`);
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
  resolve(path: Path): Ctx {
    if (path.length === 0) {
      return this;
    }

    const [fragment, ...next] = path;
    const child = this.resolveFragment(fragment);
    return child.resolve(next);
  }

  resolveFragment(fragment: PathFragment): Ctx {
    throw Error(`Ctx ${pathToString(this.layout.path)} cannot resolve path fragment: ${pathFragmentToString(fragment)}`);
  }
  // #endregion

  // #region Mount stuff
  protected _isMounted: boolean = true;

  get isMounted(): boolean {
    return this._isMounted;
  }

  protected ctxWillUnmount(): void {
    const getRevoked = (desc: string) => () => {
      throw Error(`Cannot access ${desc}: Ctx ${pathToString(this.layout.path)} not mounted`);
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

// #region MaagedCtx
export interface ManagedCtx<C extends Ctx = Ctx> {
  readonly ctx: C;
  readonly unmount: () => void;
}

export interface ManagedCtxMap {
  readonly [key: string]: ManagedCtx;
}
// #endregion
