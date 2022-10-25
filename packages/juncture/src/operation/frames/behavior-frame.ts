/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import { CursorHost } from '../frame-equipment/cursor';
import { DetectInstrument } from '../frame-equipment/instruments/detect-instrument';
import { DispatchPicker } from '../frame-equipment/instruments/pickers/dispatch-picker';
import { EmitPicker } from '../frame-equipment/instruments/pickers/emit-picker';
import { ExecPicker } from '../frame-equipment/instruments/pickers/exec-picker';
import { InstrumentKit } from '../kits/instrument-kit';
import { createFrame, Frame } from './frame';

export interface BehaviorFrame<D extends Driver> extends Frame<D> {
  readonly detect: DetectInstrument<D>;

  readonly dispatch: DispatchPicker<D>;
  readonly emit: EmitPicker<D>;
  readonly exec: ExecPicker<D>;
}

export interface BehaviorFrameHost<D extends Driver> {
  readonly behavior: BehaviorFrame<D>;
}

export function createBehaviorFrame<D extends Driver>(
  cursorHost: CursorHost<D>,
  instruments: InstrumentKit<D>
): BehaviorFrame<D> {
  const frame: any = createFrame(cursorHost, instruments);
  defineLazyProperty(frame, 'dispatch', () => instruments.dispatch);
  defineLazyProperty(frame, 'emit', () => instruments.emit);
  defineLazyProperty(frame, 'exec', () => instruments.exec);
  return frame;
}

export interface OverrideBehaviorFrame<D extends Driver, S> extends BehaviorFrame<D> {
  readonly parent: S;
}
