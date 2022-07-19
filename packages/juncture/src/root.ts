/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ValueOfType } from './bare-juncture';
import { BindedContext } from './context/context';
import { Juncture, JunctureType } from './juncture';

export class Root<JT extends JunctureType> {
  protected readonly juncture: InstanceType<JT>;

  constructor(public readonly Type: JT, state?: ValueOfType<JT>) {
    this.juncture = Juncture.getInstance(Type);
    const driver = Juncture.getDriver(this.juncture);
    const initialState = state === undefined ? driver.schema.defaultValue : state;
    this._state = initialState;
  }

  protected _state: ValueOfType<JT>;

  get state(): ValueOfType<JT> {
    return this._state;
  }

  // TODO: Implemen getContext and remove static context...
  readonly context: BindedContext<InstanceType<JT>> = undefined!;
}
