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
import { DispatchPicker } from '../frame-equipment/pickers/dispatch-picker';
import { EmitPicker } from '../frame-equipment/pickers/emit-picker';
import { ExecPicker } from '../frame-equipment/pickers/exec-picker';
import { InstrumentKit } from '../kits/instrument-kit';
import { PickerKit } from '../kits/picker-kit';
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
  instruments: InstrumentKit<D>,
  pickers: PickerKit<D>
): BehaviorFrame<D> {
  const frame: any = createFrame(cursorHost, instruments, pickers);
  defineLazyProperty(frame, 'dispatch', () => pickers.dispatch);
  defineLazyProperty(frame, 'emit', () => pickers.emit);
  defineLazyProperty(frame, 'exec', () => pickers.exec);
  return frame;
}

export interface OverrideBehaviorFrame<D extends Driver, S> extends BehaviorFrame<D> {
  readonly parent: S;
}
