/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Action } from './context/action';
import {
  Ctx, CtxConfig, CtxLayout, CtxMediator
} from './context/ctx';
import { getCtx, isCtxHost } from './context/ctx-host';
import { Frame } from './context/frames/frame';
import { Juncture, JunctureType, ValueOfType } from './juncture';

export interface RootCtxMediator {
  dispatch(action: Action): void;
}

export class Root<JT extends JunctureType> {
  constructor(public readonly Type: JT, value?: ValueOfType<JT>) {
    this.dispatch = this.dispatch.bind(this);

    const schema = Juncture.getSchema(Type);
    const initialValue = value === undefined ? schema.defaultValue : value;
    this._value = initialValue;

    const layout: CtxLayout = {
      path: [],
      parent: null,
      isUnivocal: true,
      isDivergent: false
    };
    const ctxMediator: CtxMediator = {
      getValue: () => this._value,
      setValue: newValue => {
        this._value = newValue;
      }
    };
    const rootMediator: RootCtxMediator = {
      dispatch: this.dispatch
    };
    const ctxConfig: CtxConfig = {
      layout,
      ctxMediator,
      rootMediator
    };

    this.ctx = Juncture.createCtx(Type, ctxConfig);
    this.frame = this.ctx.frame as any;
  }

  protected _value: ValueOfType<JT>;

  get value(): ValueOfType<JT> {
    // return this.ctx.getValue();
    return this._value;
  }

  protected readonly ctx: Ctx;

  // TODO: Implement getFrame and remove static frame...
  readonly frame: Frame<InstanceType<JT>>;

  // TODO: Implement this
  // unmount(): void {}

  // eslint-disable-next-line class-methods-use-this
  dispatch(action: Action) {
    // TODO: Implement this
    if (isCtxHost(action.target)) {
      const ctx = getCtx(action.target);
      ctx.executeAction(action.key, action.args);
    }
  }
}
