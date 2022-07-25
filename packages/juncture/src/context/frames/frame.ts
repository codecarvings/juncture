/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Juncture, ValueOf } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { SelectBin } from '../bins/select-bin';
import { Cursor, CursorProvider, JunctureOfCursor } from '../cursor';
import { AccessorKit } from '../kits/accessor-kit';

// export interface UnbindedFrame<Z> {
//   readonly _: Z;

//   value<C extends Cursor>(_: C): ValueOf<JunctureOfCursor<C>>;
//   select<C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
//   dispach<C extends Cursor>(_: C): DispatchBin<JunctureOfCursor<C>>;
// }

export interface Frame<J extends Juncture> {
  readonly _ : CursorOf<J>;

  value(): ValueOf<J>;
  value<C extends Cursor>(_: C): ValueOf<JunctureOfCursor<C>>;

  select(): SelectBin<J>;
  select<C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export function createFrame<J extends Juncture>(
  cursorProvider: CursorProvider<J>,
  accessors: AccessorKit<J>
): Frame<J> {
  const frame: any = { };
  defineLazyProperty(frame, '_', () => cursorProvider.cursor);
  defineLazyProperty(frame, 'value', () => accessors.value);
  defineLazyProperty(frame, 'select', () => accessors.select);
  return frame;
}
