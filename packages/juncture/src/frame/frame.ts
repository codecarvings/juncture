/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Cursor, JunctureOfCursor } from '../context/cursor';
import { CursorOf, Juncture, ValueOf } from '../juncture';
import { DispatchBin } from './bin/dispatch-bin';
import { SelectBin } from './bin/select-bin';

export interface Frame<Z> {
  readonly _: Z;

  value<C extends Cursor>(_: C): ValueOf<JunctureOfCursor<C>>;
  select<C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
  dispach<C extends Cursor>(_: C): DispatchBin<JunctureOfCursor<C>>;
}

// Cannot use interface extends... because methods are overriden (not overloaded)
export type BindedFrame<J extends Juncture> = Frame<CursorOf<J>> & {
  value(): ValueOf<J>;
  select(): SelectBin<J>;
  dispach(): DispatchBin<J>;
};
