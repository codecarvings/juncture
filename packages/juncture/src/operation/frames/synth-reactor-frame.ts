/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver, ValueOf } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import { ApplyBin, XpApplyBin } from '../bins/apply-bin';
import {
    Cursor, CursorHost, DriverOfCursor, ValueOfCursor
} from '../frame-equipment/cursor';
import { ValueAccessorHost } from '../frame-equipment/value-accessor';
import { Instruction } from '../instruction';
import { PickerKit } from '../kits/picker-kit';
import { createFrame, Frame } from './frame';

export interface SynthReactorFrame<D extends Driver> extends Frame<D> {
  set(value: ValueOf<D>): Instruction;
  set<C extends Cursor>(_: C, value: ValueOfCursor<C>): Instruction;

  apply(): ApplyBin<D>;
  apply(_: CursorOf<D>): ApplyBin<D>;
  apply<C extends Cursor>(_: C): XpApplyBin<DriverOfCursor<C>>;
}

export interface SynthReactorFrameHost<D extends Driver> {
  readonly synthReactor: SynthReactorFrame<D>;
}

export function createSynthReactorFrame<D extends Driver>(
  cursorHost: CursorHost<D>,
  valueAccessorHost: ValueAccessorHost<D>,
  pickers: PickerKit<D>
): Frame<D> {
  const frame: any = createFrame(cursorHost, valueAccessorHost, pickers);
  defineLazyProperty(frame, 'set', () => valueAccessorHost.value.set);
  defineLazyProperty(frame, 'apply', () => pickers.apply);
  return frame;
}

export interface OverrideSynthReactorFrame<D extends Driver, S> extends SynthReactorFrame<D> {
  readonly parent: S;
}
