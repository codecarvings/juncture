/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { InternalPrepareBin, PrepareBin } from '../bins/prepare-bin';
import { Cursor, InternalCursorHost, JunctureOfCursor } from '../cursor';
import { InternalAccessorKit } from '../kits/accessor-kit';
import { createInternalFrame, InternalFrame } from './internal-frame';

export interface TriggerFrame<J extends Juncture> extends InternalFrame<J> {
  prepare(): InternalPrepareBin<J>;
  prepare(_: this['_']): InternalPrepareBin<J>;
  prepare<C extends Cursor>(_: C): PrepareBin<JunctureOfCursor<C>>;
}

export interface TriggerFrameHost<J extends Juncture> {
  readonly trigger: TriggerFrame<J>;
}

export function createTriggerFrame<J extends Juncture>(
  internalCursorProviuder: InternalCursorHost<J>,
  accessors: InternalAccessorKit<J>
): InternalFrame<J> {
  const frame: any = createInternalFrame(internalCursorProviuder, accessors);
  defineLazyProperty(frame, 'prepare', () => accessors.prepare);
  return frame;
}

export interface OverrideTriggerFrame<J extends Juncture, S> extends TriggerFrame<J> {
  readonly parent: S;
}
