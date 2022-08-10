/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { InternalCursorHost } from '../cursor';
import { createReactorFrame, ReactorFrame } from '../frames/reactor-frame';
import { createReducerFrame, ReducerFrame } from '../frames/reducer-frame';
import { createSelectorFrame, SelectorFrame } from '../frames/selector-frame';
import { createTriggerFrame, TriggerFrame } from '../frames/trigger-frame';
import { InternalAccessorKit } from './accessor-kit';

// #region InternalFrameKit
export interface InternalFrameKit<J extends Juncture = Juncture> {
  readonly selector: SelectorFrame<J>;
  readonly reducer: ReducerFrame<J>;
  readonly trigger: TriggerFrame<J>;
  readonly reactor: ReactorFrame<J>;
}

export function equipInternalFrameKit(
  frames: any,
  internalCursorProviuder: InternalCursorHost,
  accessors: InternalAccessorKit
) {
  defineLazyProperty(frames, 'selector', () => createSelectorFrame(internalCursorProviuder, accessors));
  defineLazyProperty(frames, 'reducer', () => createReducerFrame(internalCursorProviuder, accessors));
  defineLazyProperty(frames, 'trigger', () => createTriggerFrame(internalCursorProviuder, accessors));
  defineLazyProperty(frames, 'reactor', () => createReactorFrame(internalCursorProviuder, accessors));
}
// #endregion
