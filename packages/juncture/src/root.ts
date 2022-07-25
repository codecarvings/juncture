/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Frame } from './context/frames/frame';
import {
  CtxOfType, Juncture, JunctureType, ValueOfType
} from './juncture';

export class Root<JT extends JunctureType> {
  constructor(public readonly Type: JT, value?: ValueOfType<JT>) {
    const schema = Juncture.getSchema(Type);
    const initialValue = value === undefined ? schema.defaultValue : value;
    this._value = initialValue;

    this.ctx = Juncture.createCtx(Type, {
      layout: {
        path: [],
        parent: null,
        isUnivocal: true,
        isDivergent: false
      }
    }) as CtxOfType<JT>;
    this.frame = this.ctx.frame as any;
  }

  protected _value: ValueOfType<JT>;

  get value(): ValueOfType<JT> {
    // return this.ctx.getValue();
    return this._value;
  }

  protected readonly ctx: CtxOfType<JT>;

  // TODO: Implement getFrame and remove static frame...
  readonly frame: Frame<InstanceType<JT>>;

  // TODO: Implement this
  // unmount(): void {}
}
