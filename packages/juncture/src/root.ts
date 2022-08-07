/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Action } from './context/action';
import { Ctx, CtxLayout, CtxMediator } from './context/ctx';
import { getCtx, isCtxHost } from './context/ctx-host';
import { Frame } from './context/frames/frame';
import { Juncture, JunctureType, ValueOfType } from './juncture';

export class Root<JT extends JunctureType> {
  constructor(public readonly Type: JT, value?: ValueOfType<JT>) {
    this.dispatch = this.dispatch.bind(this);

    this._value = this.getInitialValue(value);

    this.ctx = this.createCtx();
    this.frame = this.ctx.frame as any;
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
  protected readonly ctx: Ctx;

  protected ctxUnmount: () => void = undefined!;

  protected createCtx(): Ctx {
    const layout: CtxLayout = {
      path: [],
      parent: null,
      isUnivocal: true,
      isDivergent: false
    };
    const mediator: CtxMediator = {
      enroll: um => { this.ctxUnmount = um; },
      getValue: () => this._value,
      setValue: newValue => {
        // New Value check performed in Ctx.executeAction method
        this._value = newValue;
        this.ctx.detectValueChange();
      },
      dispatch: this.dispatch
    };

    return Juncture.createCtx(this.Type, layout, mediator);
  }

  get isMounted(): boolean {
    return this.ctx.isMounted;
  }

  unmount() {
    this.ctxUnmount();
  }
  // #endregion

  // eslint-disable-next-line class-methods-use-this
  dispatch(action: Action) {
    // TODO: Implement this
    if (isCtxHost(action.target)) {
      const ctx = getCtx(action.target);
      ctx.executeAction(action.key, action.args);
    }
  }

  // TODO: Implement getFrame and remove static frame...
  readonly frame: Frame<InstanceType<JT>>;
}
