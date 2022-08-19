/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalCursorOf, Juncture, ValueOf } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { InternalSelectBin, SelectBin } from '../bins/select-bin';
import {
  Cursor, InternalCursorHost, JunctureOfCursor, ValueOfCursor
} from '../equipment/cursor';
import { ValueHandlerHost } from '../equipment/value-handler';
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
  value<C extends Cursor>(_: C): ValueOfCursor<C>;

  select(): InternalSelectBin<J>;
  select(_: this['_']): InternalSelectBin<J>;
  select<C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export interface InternalFrameHost<J extends Juncture> {
  readonly internal: InternalFrame<J>;
}

export function createInternalFrame<J extends Juncture>(
  internalCursorHost: InternalCursorHost<J>,
  valueHandlerHost: ValueHandlerHost<J>,
  accessors: InternalAccessorKit<J>
): InternalFrame<J> {
  const frame: any = { };
  defineLazyProperty(frame, '_', () => internalCursorHost.internalCursor);
  defineLazyProperty(frame, 'value', () => valueHandlerHost.value.get);
  defineLazyProperty(frame, 'select', () => accessors.select);
  return frame;
}

export interface OverrideInternalFrame<J extends Juncture, S> extends InternalFrame<J> {
  readonly parent: S;
}
