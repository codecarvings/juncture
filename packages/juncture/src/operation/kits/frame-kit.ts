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
import { BehaviorFrame, createBehaviorFrame } from '../frames/behavior-frame';
import { createFrame, Frame } from '../frames/frame';
import { createProcedureFrame, ProcedureFrame } from '../frames/procedure-frame';
import { createSynthReactorFrame, SynthReactorFrame } from '../frames/synth-reactor-frame';
import { InstrumentKit } from './instrument-kit';
import { PickerKit } from './picker-kit';

// #region FrameKit
export interface FrameKit<D extends Driver = Driver> {
  readonly default: Frame<D>;
  readonly synthReactor: SynthReactorFrame<D>;
  readonly behavior: BehaviorFrame<D>;
  readonly : ProcedureFrame<D>;
}

export function prepareFrameKit<D extends Driver>(
  frames: any,
  cursorHost: CursorHost<D>,
  instruments: InstrumentKit<D>,
  pickers: PickerKit<D>
) {
  defineLazyProperty(frames, 'default', () => createFrame(cursorHost, instruments, pickers));
  defineLazyProperty(frames, 'synthReactor', () => createSynthReactorFrame(cursorHost, instruments, pickers));
  defineLazyProperty(frames, 'behavior', () => createBehaviorFrame(cursorHost, instruments, pickers));
  defineLazyProperty(frames, 'procedure', () => createProcedureFrame(cursorHost, instruments, pickers));
}
// #endregion
