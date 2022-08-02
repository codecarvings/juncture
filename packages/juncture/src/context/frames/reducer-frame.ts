/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { PrivateReduceBin, ReduceBin } from '../bins/reduce-bin';
import {
  Cursor, JunctureOfCursor, PrivateCursorHost
} from '../cursor';
import { PrivateAccessorKit } from '../kits/accessor-kit';
import { createPrivateFrame, PrivateFrame } from './private-frame';

export interface ReducerFrame<J extends Juncture> extends PrivateFrame<J> {
  reduce(): PrivateReduceBin<J>;
  reduce(_: this['_']): PrivateReduceBin<J>;
  reduce<C extends Cursor>(_: C): ReduceBin<JunctureOfCursor<C>>;
}

export interface ReducerFrameHost<J extends Juncture> {
  readonly reducer: ReducerFrame<J>;
}

export function createReducerFrame<J extends Juncture>(
  privateCursorProviuder: PrivateCursorHost<J>,
  accessors: PrivateAccessorKit<J>
): ReducerFrame<J> {
  const frame: any = createPrivateFrame(privateCursorProviuder, accessors);
  defineLazyProperty(frame, 'reduce', () => accessors.reduce);
  return frame;
}

export interface OverrideReducerFrame<J extends Juncture, S> extends ReducerFrame<J> {
  readonly parent: S;
}
