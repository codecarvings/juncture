/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver, ValueOf } from '../../driver';
import { defineLazyProperty } from '../../tool/object';
import { ApplyBin, OuterApplyBin } from '../bins/apply-bin';
import {
  Cursor, CursorHost, DriverOfCursor, ValueOfCursor
} from '../frame-equipment/cursor';
import { ValueHandlerHost } from '../frame-equipment/value-handler';
import { Instruction } from '../instruction';
import { AccessorKit } from '../kits/accessor-kit';
import { createFrame, Frame } from './frame';

export interface SynthReactorFrame<D extends Driver> extends Frame<D> {
  set(value: ValueOf<D>): Instruction;
  set<C extends Cursor>(_: C, value: ValueOfCursor<C>): Instruction;

  apply(): ApplyBin<D>;
  apply(_: this['_']): ApplyBin<D>;
  apply<C extends Cursor>(_: C): OuterApplyBin<DriverOfCursor<C>>;
}

export interface SynthReactorFrameHost<D extends Driver> {
  readonly synthReactor: SynthReactorFrame<D>;
}

export function createSynthReactorFrame<D extends Driver>(
  cursorHost: CursorHost<D>,
  valueHandlerHost: ValueHandlerHost<D>,
  accessors: AccessorKit<D>
): Frame<D> {
  const frame: any = createFrame(cursorHost, valueHandlerHost, accessors);
  defineLazyProperty(frame, 'set', () => valueHandlerHost.value.set);
  defineLazyProperty(frame, 'apply', () => accessors.apply);
  return frame;
}

export interface OverrideSynthReactorFrame<D extends Driver, S> extends SynthReactorFrame<D> {
  readonly parent: S;
}
