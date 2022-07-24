/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BindedFrame } from './frame/frame';
import { Juncture, JunctureType, ValueOfType } from './juncture';

export class Root<JT extends JunctureType> {
  constructor(public readonly Type: JT, state?: ValueOfType<JT>) {
    const schema = Juncture.getSchema(Type);
    const initialState = state === undefined ? schema.defaultValue : state;
    this._state = initialState;
  }

  protected _state: ValueOfType<JT>;

  get state(): ValueOfType<JT> {
    return this._state;
  }

  // TODO: Implement getFrame and remove static frame...
  readonly frame: BindedFrame<InstanceType<JT>> = undefined!;

  // TODO: Implement this
  // unmount(): void {}
}
