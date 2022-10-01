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
import { ValueAccessorHost } from '../frame-equipment/value-accessor';
import { BehaviorFrame, createBehaviorFrame } from '../frames/behavior-frame';
import { createFrame, Frame } from '../frames/frame';
import { createSynthReactorFrame, SynthReactorFrame } from '../frames/synth-reactor-frame';
import { PickerKit } from './picker-kit';

// #region FrameKit
export interface FrameKit<D extends Driver = Driver> {
  readonly default: Frame<D>;
  readonly synthReactor: SynthReactorFrame<D>;
  readonly behavior: BehaviorFrame<D>;
}

export function prepareFrameKit<D extends Driver>(
  frames: any,
  cursorHost: CursorHost<D>,
  valueAccessorHost: ValueAccessorHost<D>,
  pickers: PickerKit<D>
) {
  defineLazyProperty(frames, 'default', () => createFrame(cursorHost, valueAccessorHost, pickers));
  defineLazyProperty(frames, 'synthReactor', () => createSynthReactorFrame(cursorHost, valueAccessorHost, pickers));
  defineLazyProperty(frames, 'behavior', () => createBehaviorFrame(cursorHost, valueAccessorHost, pickers));
}
// #endregion
