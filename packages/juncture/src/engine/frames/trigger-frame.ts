/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, ValueOf } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { ApplyBin, InternalApplyBin } from '../bins/apply-bin';
import {
  Cursor, InternalCursorHost, JunctureOfCursor, ValueOfCursor
} from '../equipment/cursor';
import { ValueHandlerHost } from '../equipment/value-handler';
import { Instruction } from '../instruction';
import { InternalAccessorKit } from '../kits/accessor-kit';
import { createInternalFrame, InternalFrame } from './internal-frame';

export interface TriggerFrame<J extends Juncture> extends InternalFrame<J> {
  set(value: ValueOf<J>): Instruction;
  set<C extends Cursor>(_: C, value: ValueOfCursor<C>): Instruction;

  apply(): InternalApplyBin<J>;
  apply(_: this['_']): InternalApplyBin<J>;
  apply<C extends Cursor>(_: C): ApplyBin<JunctureOfCursor<C>>;
}

export interface TriggerFrameHost<J extends Juncture> {
  readonly trigger: TriggerFrame<J>;
}

export function createTriggerFrame<J extends Juncture>(
  internalCursorHost: InternalCursorHost<J>,
  valueHandlerHost: ValueHandlerHost<J>,
  accessors: InternalAccessorKit<J>
): InternalFrame<J> {
  const frame: any = createInternalFrame(internalCursorHost, valueHandlerHost, accessors);
  defineLazyProperty(frame, 'set', () => valueHandlerHost.value.set);
  defineLazyProperty(frame, 'apply', () => accessors.apply);
  return frame;
}

export interface OverrideTriggerFrame<J extends Juncture, S> extends TriggerFrame<J> {
  readonly parent: S;
}
