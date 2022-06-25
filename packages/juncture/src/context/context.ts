/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Cursor, JunctureOfCursor } from '../frame/cursor';
import { CursorOf, Juncture, ValueOf } from '../juncture';
import { DispatchBin } from './dispatch-bin';
import { SelectBin } from './select-bin';

export interface Context<Z> {
  readonly _: Z;

  value<C extends Cursor<any>>(_: C): ValueOf<JunctureOfCursor<C>>;

  select<C extends Cursor<any>>(_: C): SelectBin<JunctureOfCursor<C>>;

  dispach<C extends Cursor<any>>(_: C): DispatchBin<JunctureOfCursor<C>>;
}

export interface BindedContext<J extends Juncture> extends Context<CursorOf<J>> {
  value(): ValueOf<J>;
  select(): SelectBin<J>;
  dispach(): DispatchBin<J>;
}
