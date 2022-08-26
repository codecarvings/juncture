/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver, ValueOf } from '../../driver';
import { defineLazyProperty } from '../../tool/object';
import { OuterSelectBin, SelectBin } from '../bins/select-bin';
import {
  Cursor, CursorHost, DriverOfCursor, ValueOfCursor
} from '../frame-equipment/cursor';
import { ValueHandlerHost } from '../frame-equipment/value-handler';
import { AccessorKit } from '../kits/accessor-kit';

// #region Symbols
const frameSymbol = Symbol('frame');
interface FrameSymbols {
  readonly frame: typeof frameSymbol;
}
const frameSymbols: FrameSymbols = {
  frame: frameSymbol
};
// #endregion

export interface FrameConsumer<B> {
  (frame: FrameMark): B;
}

interface FrameMark {
  readonly [frameSymbols.frame]: true;
}

export interface Frame<D extends Driver> extends FrameMark {
  readonly _ : CursorOf<D>;

  value(): ValueOf<D>;
  value<C extends Cursor>(_: C): ValueOfCursor<C>;

  select(): SelectBin<D>;
  select(_: this['_']): SelectBin<D>;
  select<C extends Cursor>(_: C): OuterSelectBin<DriverOfCursor<C>>;
}

export interface DefaultFrameHost<D extends Driver> {
  readonly default: Frame<D>;
}

export function createFrame<D extends Driver>(
  cursorHost: CursorHost<D>,
  valueHandlerHost: ValueHandlerHost<D>,
  accessors: AccessorKit<D>
): Frame<D> {
  const frame: any = { };
  defineLazyProperty(frame, '_', () => cursorHost.cursor);
  defineLazyProperty(frame, 'value', () => valueHandlerHost.value.get);
  defineLazyProperty(frame, 'select', () => accessors.select);
  return frame;
}

export interface OverrideFrame<D extends Driver, S> extends Frame<D> {
  readonly parent: S;
}
