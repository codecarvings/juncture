/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import { CursorHost } from '../frame-equipment/cursor';
import { SetInstrument } from '../frame-equipment/instruments/set-instrument';
import { ApplyPicker } from '../frame-equipment/pickers/apply-picker';
import { InstrumentKit } from '../kits/instrument-kit';
import { PickerKit } from '../kits/picker-kit';
import { createFrame, Frame } from './frame';

export interface SynthReactorFrame<D extends Driver> extends Frame<D> {
  readonly set: SetInstrument<D>;

  readonly apply: ApplyPicker<D>;
}

export interface SynthReactorFrameHost<D extends Driver> {
  readonly synthReactor: SynthReactorFrame<D>;
}

export function createSynthReactorFrame<D extends Driver>(
  cursorHost: CursorHost<D>,
  instruments: InstrumentKit<D>,
  pickers: PickerKit<D>
): Frame<D> {
  const frame: any = createFrame(cursorHost, instruments, pickers);
  defineLazyProperty(frame, 'set', () => instruments.set);
  defineLazyProperty(frame, 'apply', () => pickers.apply);
  return frame;
}

export interface OverrideSynthReactorFrame<D extends Driver, S> extends SynthReactorFrame<D> {
  readonly parent: S;
}
