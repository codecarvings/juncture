/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { PrivateCursorHost } from '../cursor';
import { createMixReducerFrame, MixReducerFrame } from '../frames/mix-reducer-frame';
import { createReducerFrame, ReducerFrame } from '../frames/reducer-frame';
import { createSelectorFrame, SelectorFrame } from '../frames/selector-frame';
import { PrivateAccessorKit } from './accessor-kit';

// #region PrivateFrameKit
export interface PrivateFrameKit<J extends Juncture = Juncture> {
  readonly selector: SelectorFrame<J>;
  readonly reducer: ReducerFrame<J>;
  readonly mixReducer: MixReducerFrame<J>;
}

export function preparePrivateFrameKit(
  frames: any,
  privateCursorProviuder: PrivateCursorHost,
  accessors: PrivateAccessorKit
) {
  defineLazyProperty(frames, 'selector', () => createSelectorFrame(privateCursorProviuder, accessors));
  defineLazyProperty(frames, 'reducer', () => createReducerFrame(privateCursorProviuder, accessors));
  defineLazyProperty(frames, 'mixReducer', () => createMixReducerFrame(privateCursorProviuder, accessors));
}
// #endregion
