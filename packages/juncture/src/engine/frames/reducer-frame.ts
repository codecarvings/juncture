/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { InternalReduceBin, ReduceBin } from '../bins/reduce-bin';
import {
  Cursor, InternalCursorHost, JunctureOfCursor
} from '../cursor';
import { InternalAccessorKit } from '../kits/accessor-kit';
import { createInternalFrame, InternalFrame } from './internal-frame';

export interface ReducerFrame<J extends Juncture> extends InternalFrame<J> {
  reduce(): InternalReduceBin<J>;
  reduce(_: this['_']): InternalReduceBin<J>;
  reduce<C extends Cursor>(_: C): ReduceBin<JunctureOfCursor<C>>;
}

export interface ReducerFrameHost<J extends Juncture> {
  readonly reducer: ReducerFrame<J>;
}

export function createReducerFrame<J extends Juncture>(
  internalCursorProviuder: InternalCursorHost<J>,
  accessors: InternalAccessorKit<J>
): ReducerFrame<J> {
  const frame: any = createInternalFrame(internalCursorProviuder, accessors);
  defineLazyProperty(frame, 'reduce', () => accessors.reduce);
  return frame;
}

export interface OverrideReducerFrame<J extends Juncture, S> extends ReducerFrame<J> {
  readonly parent: S;
}
