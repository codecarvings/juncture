/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import { DispatchBin, XpDispatchBin } from '../bins/dispatch-bin';
import { EmitBin } from '../bins/emit-bin';
import { ExecBin, XpExecBin } from '../bins/exec-bin';
import { Cursor, CursorHost, DriverOfCursor } from '../frame-equipment/cursor';
import { DetectPack } from '../frame-equipment/detect-pack';
import { ValueAccessorHost } from '../frame-equipment/value-accessor';
import { PickerKit } from '../kits/picker-kit';
import { createFrame, Frame } from './frame';

export interface BehaviorFrame<D extends Driver> extends Frame<D> {
  readonly detect: DetectPack<D>;

  dispatch(): DispatchBin<D>;
  dispatch(_: CursorOf<D>): DispatchBin<D>;
  dispatch<C extends Cursor>(_: C): XpDispatchBin<DriverOfCursor<C>>;

  emit(): EmitBin<D>;
  emit(_: CursorOf<D>): EmitBin<D>;

  exec(): ExecBin<D>;
  exec(_: CursorOf<D>): ExecBin<D>;
  exec<C extends Cursor>(_: C): XpExecBin<DriverOfCursor<C>>;
}

export interface BehaviorFrameHost<D extends Driver> {
  readonly behavior: BehaviorFrame<D>;
}

export function createBehaviorFrame<D extends Driver>(
  cursorHost: CursorHost<D>,
  valueAccessorHost: ValueAccessorHost<D>,
  pickers: PickerKit<D>
): BehaviorFrame<D> {
  const frame: any = createFrame(cursorHost, valueAccessorHost, pickers);
  defineLazyProperty(frame, 'dispatch', () => pickers.dispatch);
  defineLazyProperty(frame, 'emit', () => pickers.emit);
  defineLazyProperty(frame, 'exec', () => pickers.exec);
  return frame;
}

export interface OverrideBehaviorFrame<D extends Driver, S> extends BehaviorFrame<D> {
  readonly parent: S;
}
