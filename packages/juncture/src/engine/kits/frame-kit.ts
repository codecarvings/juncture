/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { InternalCursorHost } from '../equipment/cursor';
import { ValueHandlerHost } from '../equipment/value-handler';
import { createInternalFrame, InternalFrame } from '../frames/internal-frame';
import { createReactorFrame, ReactorFrame } from '../frames/reactor-frame';
import { createTriggerFrame, TriggerFrame } from '../frames/trigger-frame';
import { InternalAccessorKit } from './accessor-kit';

// #region InternalFrameKit
export interface InternalFrameKit<J extends Juncture = Juncture> {
  readonly internal: InternalFrame<J>;
  readonly trigger: TriggerFrame<J>;
  readonly reactor: ReactorFrame<J>;
}

export function equipInternalFrameKit<J extends Juncture>(
  frames: any,
  internalCursorHost: InternalCursorHost<J>,
  valueHandlerHost: ValueHandlerHost<J>,
  accessors: InternalAccessorKit<J>
) {
  defineLazyProperty(frames, 'internal', () => createInternalFrame(internalCursorHost, valueHandlerHost, accessors));
  // eslint-disable-next-line max-len
  defineLazyProperty(frames, 'trigger', () => createTriggerFrame(internalCursorHost, valueHandlerHost, accessors));
  defineLazyProperty(frames, 'reactor', () => createReactorFrame(internalCursorHost, valueHandlerHost, accessors));
}
// #endregion
