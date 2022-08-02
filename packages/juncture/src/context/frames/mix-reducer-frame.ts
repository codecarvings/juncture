/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { PrepareBin, PrivatePrepareBin } from '../bins/prepare-bin';
import { Cursor, JunctureOfCursor, PrivateCursorHost } from '../cursor';
import { PrivateAccessorKit } from '../kits/accessor-kit';
import { createPrivateFrame, PrivateFrame } from './private-frame';

export interface MixReducerFrame<J extends Juncture> extends PrivateFrame<J> {
  prepare(): PrivatePrepareBin<J>;
  prepare(_: this['_']): PrivatePrepareBin<J>;
  prepare<C extends Cursor>(_: C): PrepareBin<JunctureOfCursor<C>>;
}

export interface MixReducerFrameHost<J extends Juncture> {
  readonly mixReducer: MixReducerFrame<J>;
}

export function createMixReducerFrame<J extends Juncture>(
  privateCursorProviuder: PrivateCursorHost<J>,
  accessors: PrivateAccessorKit<J>
): PrivateFrame<J> {
  const frame: any = createPrivateFrame(privateCursorProviuder, accessors);
  defineLazyProperty(frame, 'prepare', () => accessors.prepare);
  return frame;
}

export interface OverrideMixReducerFrame<J extends Juncture, S> extends MixReducerFrame<J> {
  readonly parent: S;
}
