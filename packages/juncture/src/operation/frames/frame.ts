/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import { DepsBin } from '../bins/deps-bin';
import { CursorHost } from '../frame-equipment/cursor';
import { ValueInstrument } from '../frame-equipment/instruments/value-instrument';
import { SelectPicker } from '../frame-equipment/pickers/select-picker';
import { InstrumentKit } from '../kits/instrument-kit';
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

  readonly value: ValueInstrument<D>;

  readonly select: SelectPicker<D>;
}

export interface DefaultFrameHost<D extends Driver> {
  readonly default: Frame<D>;
}

export function createFrame<D extends Driver>(
  cursorHost: CursorHost<D>,
  instruments: InstrumentKit<D>,
  pickers: PickerKit<D>
): Frame<D> {
  const frame: any = { };
  defineLazyProperty(frame, '_', () => cursorHost.cursor);
  defineLazyProperty(frame, 'value', () => instruments.value);
  defineLazyProperty(frame, 'select', () => pickers.select);
  return frame;
}

export interface OverrideFrame<D extends Driver, S> extends Frame<D> {
  readonly parent: S;
}
