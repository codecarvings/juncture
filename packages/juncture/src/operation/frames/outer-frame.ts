/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver, OuterCursorOf, ValueOf } from '../../driver';
import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { OuterDispatchBin } from '../bins/dispatch-bin';
import { OuterEmitBin } from '../bins/emit-bin';
import { OuterSelectBin } from '../bins/select-bin';
import { OuterTriggerBin } from '../bins/trigger-bin';
import {
  Cursor, DriverOfCursor, OuterCursorHost, ValueOfCursor
} from '../frame-equipment/cursor';
import { ValueHandlerHost } from '../frame-equipment/value-handler';
import { OuterAccessorKit } from '../kits/accessor-kit';

export interface OuterFrame<D extends Driver = Driver> {
  readonly _ : OuterCursorOf<D>;

  value(): ValueOf<D>;
  value<C extends Cursor>(_: C): ValueOfCursor<C>;

  select(): OuterSelectBin<D>;
  select<C extends Cursor>(_: C): OuterSelectBin<DriverOfCursor<C>>;

  dispatch(): OuterDispatchBin<D>;
  dispatch<C extends Cursor>(_: C): OuterDispatchBin<DriverOfCursor<C>>;

  emit(): OuterEmitBin<D>;
  emit<C extends Cursor>(_: C): OuterEmitBin<DriverOfCursor<C>>;

  trigger(): OuterTriggerBin<D>;
  trigger<C extends Cursor>(_: C): OuterTriggerBin<DriverOfCursor<C>>;
  trigger<J extends Juncture>(Juncture: J): OuterTriggerBin<InstanceType<J>>;
  trigger<C extends Cursor, J extends Juncture>(_: C, Juncture: J): OuterTriggerBin<InstanceType<J>>;
}

export function createOuterFrame<D extends Driver>(
  cursorHost: OuterCursorHost<D>,
  valueHandlerHost: ValueHandlerHost<D>,
  accessors: OuterAccessorKit<D>
): OuterFrame<D> {
  const frame: any = { };
  defineLazyProperty(frame, '_', () => cursorHost.outerCursor);
  defineLazyProperty(frame, 'value', () => valueHandlerHost.value.get);
  defineLazyProperty(frame, 'select', () => accessors.select);
  defineLazyProperty(frame, 'dispatch', () => accessors.dispatch);
  defineLazyProperty(frame, 'emit', () => accessors.emit);
  defineLazyProperty(frame, 'trigger', () => accessors.trigger);
  return frame;
}
