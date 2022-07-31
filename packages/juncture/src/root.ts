/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Ctx, CtxConfig, CtxLayout, CtxMediator
} from './context/ctx';
import { Frame } from './context/frames/frame';
import { Juncture, JunctureType, ValueOfType } from './juncture';

export class Root<JT extends JunctureType> {
  constructor(public readonly Type: JT, value?: ValueOfType<JT>) {
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
    const ctxConfig: CtxConfig = {
      layout,
      ctxMediator
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
}
