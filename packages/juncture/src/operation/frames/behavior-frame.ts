/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { DispatchBin, OuterDispatchBin } from '../bins/dispatch-bin';
import { EmitBin, OuterEmitBin } from '../bins/emit-bin';
import { OuterTriggerBin, TriggerBin } from '../bins/trigger-bin';
import { Cursor, CursorHost, DriverOfCursor } from '../frame-equipment/cursor';
import { ValueHandlerHost } from '../frame-equipment/value-handler';
import { AccessorKit } from '../kits/accessor-kit';
import { createFrame, Frame } from './frame';

export interface BehaviorFrame<D extends Driver> extends Frame<D> {
  dispatch(): DispatchBin<D>;
  dispatch(_: this['_']): DispatchBin<D>;
  dispatch<C extends Cursor>(_: C): OuterDispatchBin<DriverOfCursor<C>>;

  emit(): EmitBin<D>;
  emit(_: this['_']): EmitBin<D>;
  emit<C extends Cursor>(_: C): OuterEmitBin<DriverOfCursor<C>>;

  trigger(): TriggerBin<D>;
  trigger(_: this['_']): TriggerBin<D>;
  trigger<C extends Cursor>(_: C): OuterTriggerBin<DriverOfCursor<C>>;
  trigger<J extends Juncture>(Juncture: J): OuterTriggerBin<InstanceType<J>>;
  trigger<C extends Cursor, J extends Juncture>(_: C, Juncture: J): OuterTriggerBin<InstanceType<J>>;
}

export interface BehaviorFrameHost<D extends Driver> {
  readonly behavior: BehaviorFrame<D>;
}

export function createBehaviorFrame<D extends Driver>(
  cursorHost: CursorHost<D>,
  valueHandlerHost: ValueHandlerHost<D>,
  accessors: AccessorKit<D>
): BehaviorFrame<D> {
  const frame: any = createFrame(cursorHost, valueHandlerHost, accessors);
  defineLazyProperty(frame, 'dispatch', () => accessors.dispatch);
  defineLazyProperty(frame, 'emit', () => accessors.emit);
  defineLazyProperty(frame, 'trigger', () => accessors.trigger);
  return frame;
}

export interface OverrideBehaviorFrame<D extends Driver, S> extends BehaviorFrame<D> {
  readonly parent: S;
}
