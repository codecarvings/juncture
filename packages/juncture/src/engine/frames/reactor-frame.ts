/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { defineLazyProperty } from '../../tool/object';
import { DispatchBin, OuterDispatchBin } from '../bins/dispatch-bin';
import { OuterSourceBin, SourceBin } from '../bins/source-bin';
import { Cursor, CursorHost, DriverOfCursor } from '../frame-equipment/cursor';
import { ValueHandlerHost } from '../frame-equipment/value-handler';
import { AccessorKit } from '../kits/accessor-kit';
import { createFrame, Frame } from './frame';

export interface ReactorFrame<D extends Driver> extends Frame<D> {
  dispatch(): DispatchBin<D>;
  dispatch(_: this['_']): DispatchBin<D>;
  dispatch<C extends Cursor>(_: C): OuterDispatchBin<DriverOfCursor<C>>;

  source(): SourceBin<D>;
  source(_: this['_']): SourceBin<D>;
  source<C extends Cursor>(_: C): OuterSourceBin<DriverOfCursor<C>>;
}

export interface ReactorFrameHost<D extends Driver> {
  readonly reactor: ReactorFrame<D>;
}

export function createReactorFrame<D extends Driver>(
  cursorHost: CursorHost<D>,
  valueHandlerHost: ValueHandlerHost<D>,
  accessors: AccessorKit<D>
): ReactorFrame<D> {
  const frame: any = createFrame(cursorHost, valueHandlerHost, accessors);
  defineLazyProperty(frame, 'dispatch', () => accessors.dispatch);
  defineLazyProperty(frame, 'source', () => accessors.source);
  return frame;
}

export interface OverrideReactorFrame<D extends Driver, S> extends ReactorFrame<D> {
  readonly parent: S;
}
