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
import { GetInstrument } from '../frame-equipment/instruments/get-instrument';
import { SelectPicker } from '../frame-equipment/instruments/pickers/select-picker';
import { InstrumentKit } from '../kits/instrument-kit';

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

  readonly get: GetInstrument<D>;

  readonly select: SelectPicker<D>;
}

export interface DefaultFrameHost<D extends Driver> {
  readonly default: Frame<D>;
}

export function createFrame<D extends Driver>(
  cursorHost: CursorHost<D>,
  instruments: InstrumentKit<D>
): Frame<D> {
  const frame: any = { };
  defineLazyProperty(frame, '_', () => cursorHost.cursor);
  defineLazyProperty(frame, 'get', () => instruments.get);
  defineLazyProperty(frame, 'select', () => instruments.select);
  return frame;
}

export interface OverrideFrame<D extends Driver, S> extends Frame<D> {
  readonly parent: S;
}
