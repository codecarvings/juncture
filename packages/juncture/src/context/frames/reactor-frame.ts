/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { DispatchBin, InternalDispatchBin } from '../bins/dispatch-bin';
import {
  Cursor, InternalCursorHost, JunctureOfCursor
} from '../cursor';
import { InternalAccessorKit } from '../kits/accessor-kit';
import { createInternalFrame, InternalFrame } from './internal-frame';

export interface ReactorFrame<J extends Juncture> extends InternalFrame<J> {
  dispatch(): InternalDispatchBin<J>;
  dispatch(_: this['_']): InternalDispatchBin<J>;
  dispatch<C extends Cursor>(_: C): DispatchBin<JunctureOfCursor<C>>;
}

export interface ReactorFrameHost<J extends Juncture> {
  readonly reactor: ReactorFrame<J>;
}

export function createReactorFrame<J extends Juncture>(
  internalCursorProviuder: InternalCursorHost<J>,
  accessors: InternalAccessorKit<J>
): ReactorFrame<J> {
  const frame: any = createInternalFrame(internalCursorProviuder, accessors);
  defineLazyProperty(frame, 'dispatch', () => accessors.dispatch);
  return frame;
}

export interface OverrideReactorFrame<J extends Juncture, S> extends ReactorFrame<J> {
  readonly parent: S;
}
