/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { defineLazyProperty } from '../../tool/object';
import { CursorHost } from '../frame-equipment/cursor';
import { ValueHandlerHost } from '../frame-equipment/value-handler';
import { BehaviorFrame, createBehaviorFrame } from '../frames/behavior-frame';
import { createFrame, Frame } from '../frames/frame';
import { createSynthReactorFrame, SynthReactorFrame } from '../frames/synth-reactor-frame';
import { AccessorKit } from './accessor-kit';

// #region FrameKit
export interface FrameKit<D extends Driver = Driver> {
  readonly default: Frame<D>;
  readonly synthReactor: SynthReactorFrame<D>;
  readonly behavior: BehaviorFrame<D>;
}

export function prepareFrameKit<D extends Driver>(
  frames: any,
  cursorHost: CursorHost<D>,
  valueHandlerHost: ValueHandlerHost<D>,
  accessors: AccessorKit<D>
) {
  defineLazyProperty(frames, 'default', () => createFrame(cursorHost, valueHandlerHost, accessors));
  defineLazyProperty(frames, 'synthReactor', () => createSynthReactorFrame(cursorHost, valueHandlerHost, accessors));
  defineLazyProperty(frames, 'behavior', () => createBehaviorFrame(cursorHost, valueHandlerHost, accessors));
}
// #endregion
