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
import { createFrame, Frame } from '../frames/frame';
import { createReactorFrame, ReactorFrame } from '../frames/reactor-frame';
import { createTriggerFrame, TriggerFrame } from '../frames/trigger-frame';
import { AccessorKit } from './accessor-kit';

// #region FrameKit
export interface FrameKit<D extends Driver = Driver> {
  readonly default: Frame<D>;
  readonly trigger: TriggerFrame<D>;
  readonly reactor: ReactorFrame<D>;
}

export function prepareFrameKit<D extends Driver>(
  frames: any,
  cursorHost: CursorHost<D>,
  valueHandlerHost: ValueHandlerHost<D>,
  accessors: AccessorKit<D>
) {
  defineLazyProperty(frames, 'default', () => createFrame(cursorHost, valueHandlerHost, accessors));
  defineLazyProperty(frames, 'trigger', () => createTriggerFrame(cursorHost, valueHandlerHost, accessors));
  defineLazyProperty(frames, 'reactor', () => createReactorFrame(cursorHost, valueHandlerHost, accessors));
}
// #endregion
