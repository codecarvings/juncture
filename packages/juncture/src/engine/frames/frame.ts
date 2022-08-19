/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Juncture, ValueOf } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { DispatchBin } from '../bins/dispatch-bin';
import { SelectBin } from '../bins/select-bin';
import { SourceBin } from '../bins/source-bin';
import {
  Cursor, CursorHost, JunctureOfCursor, ValueOfCursor
} from '../equipment/cursor';
import { ValueHandlerHost } from '../equipment/value-handler';
import { AccessorKit } from '../kits/accessor-kit';

export interface Frame<J extends Juncture = Juncture> {
  readonly _ : CursorOf<J>;

  value(): ValueOf<J>;
  value<C extends Cursor>(_: C): ValueOfCursor<C>;

  select(): SelectBin<J>;
  select<C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;

  dispatch(): DispatchBin<J>;
  dispatch<C extends Cursor>(_: C): DispatchBin<JunctureOfCursor<C>>;

  source(): SourceBin<J>;
  source<C extends Cursor>(_: C): SourceBin<JunctureOfCursor<C>>;
}

export function createFrame<J extends Juncture>(
  cursorHost: CursorHost<J>,
  valueHandlerHost: ValueHandlerHost<J>,
  accessors: AccessorKit<J>
): Frame<J> {
  const frame: any = { };
  defineLazyProperty(frame, '_', () => cursorHost.cursor);
  defineLazyProperty(frame, 'value', () => valueHandlerHost.value.get);
  defineLazyProperty(frame, 'select', () => accessors.select);
  defineLazyProperty(frame, 'dispatch', () => accessors.dispatch);
  defineLazyProperty(frame, 'source', () => accessors.source);
  return frame;
}
