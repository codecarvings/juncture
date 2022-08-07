/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalCursorOf, Juncture, ValueOf } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { InternalSelectBin, SelectBin } from '../bins/select-bin';
import { Cursor, InternalCursorHost, JunctureOfCursor } from '../cursor';
import { InternalAccessorKit } from '../kits/accessor-kit';

// #region Symbols
const internalFrameSymbol = Symbol('internalFrame');
interface InternalFrameSymbols {
  readonly internalFrame: typeof internalFrameSymbol;
}
const internalFrameSymbols: InternalFrameSymbols = {
  internalFrame: internalFrameSymbol
};
// #endregion

export interface InternalFrameConsumer<B> {
  (frame: InternalFrameRole): B;
}

interface InternalFrameRole {
  readonly [internalFrameSymbols.internalFrame]: true;
}

export interface InternalFrame<J extends Juncture> extends InternalFrameRole {
  readonly _ : InternalCursorOf<J>;

  value(): ValueOf<J>;
  value<C extends Cursor>(_: C): ValueOf<JunctureOfCursor<C>>;

  select(): InternalSelectBin<J>;
  select(_: this['_']): InternalSelectBin<J>;
  select<C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export function createInternalFrame<J extends Juncture>(
  internalCursorProviuder: InternalCursorHost<J>,
  accessors: InternalAccessorKit<J>
): InternalFrame<J> {
  const frame: any = { };
  defineLazyProperty(frame, '_', () => internalCursorProviuder.internalCursor);
  defineLazyProperty(frame, 'value', () => accessors.value);
  defineLazyProperty(frame, 'select', () => accessors.select);
  return frame;
}
