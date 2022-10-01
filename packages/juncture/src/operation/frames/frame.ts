/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver, ValueOf } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import { DepsBin } from '../bins/deps-bin';
import { SelectBin, XpSelectBin } from '../bins/select-bin';
import {
  Cursor, CursorHost, DriverOfCursor, ValueOfCursor
} from '../frame-equipment/cursor';
import { ValueAccessorHost } from '../frame-equipment/value-accessor';
import { PickerKit } from '../kits/picker-kit';

// #region Private Symbols
const frameSymbol = Symbol('frame');
interface PrvSymbols {
  readonly frame: typeof frameSymbol;
}
const prvSymbols: PrvSymbols = {
  frame: frameSymbol
};
// #endregion

export interface FrameConsumer<B> {
  (frame: FrameMark): B;
}

interface FrameMark {
  readonly [prvSymbols.frame]: true;
}

export interface Frame<D extends Driver> extends FrameMark {
  readonly _: CursorOf<D>;

  readonly $: DepsBin<D>;

  value(): ValueOf<D>;
  value<C extends Cursor>(_: C): ValueOfCursor<C>;

  select(): SelectBin<D>;
  select(_: CursorOf<D>): SelectBin<D>;
  select<C extends Cursor>(_: C): XpSelectBin<DriverOfCursor<C>>;
}

export interface DefaultFrameHost<D extends Driver> {
  readonly default: Frame<D>;
}

export function createFrame<D extends Driver>(
  cursorHost: CursorHost<D>,
  valueAccessorHost: ValueAccessorHost<D>,
  pickers: PickerKit<D>
): Frame<D> {
  const frame: any = { };
  defineLazyProperty(frame, '_', () => cursorHost.cursor);
  defineLazyProperty(frame, 'value', () => valueAccessorHost.value.get);
  defineLazyProperty(frame, 'select', () => pickers.select);
  return frame;
}

export interface OverrideFrame<D extends Driver, S> extends Frame<D> {
  readonly parent: S;
}
