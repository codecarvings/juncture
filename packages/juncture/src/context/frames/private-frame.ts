/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, PrivateCursorOf, ValueOf } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { PrivateSelectBin, SelectBin } from '../bins/select-bin';
import { Cursor, JunctureOfCursor, PrivateCursorHost } from '../cursor';
import { PrivateAccessorKit } from '../kits/accessor-kit';

// #region Symbols
const privateFrameSymbol = Symbol('privateFrame');
interface PrivateFrameSymbols {
  readonly privateFrame: typeof privateFrameSymbol;
}
const privateFrameSymbols: PrivateFrameSymbols = {
  privateFrame: privateFrameSymbol
};
// #endregion

export interface PrivateFrameConsumer<B> {
  (frame: PrivateFrameRole): B;
}

interface PrivateFrameRole {
  readonly [privateFrameSymbols.privateFrame]: true;
}

export interface PrivateFrame<J extends Juncture> extends PrivateFrameRole {
  readonly _ : PrivateCursorOf<J>;

  value(): ValueOf<J>;
  value<C extends Cursor>(_: C): ValueOf<JunctureOfCursor<C>>;

  select(): PrivateSelectBin<J>;
  select(_: this['_']): PrivateSelectBin<J>;
  select<C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export function createPrivateFrame<J extends Juncture>(
  privateCursorProviuder: PrivateCursorHost<J>,
  accessors: PrivateAccessorKit<J>
): PrivateFrame<J> {
  const frame: any = { };
  defineLazyProperty(frame, '_', () => privateCursorProviuder.privateCursor);
  defineLazyProperty(frame, 'select', () => accessors.select);
  return frame;
}
