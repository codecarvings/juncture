/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { UnboundDetectInstrument } from '../frame-equipment/instruments/detect-instrument';
import { UnboundGetInstrument, unboundGetInstrument } from '../frame-equipment/instruments/get-instrument';
import { UnboundDispatchPicker, unboundDispatchPicker } from '../frame-equipment/instruments/pickers/dispatch-picker';
import { UnboundExecPicker, unboundExecPicker } from '../frame-equipment/instruments/pickers/exec-picker';
import { UnboundSelectPicker, unboundSelectPicker } from '../frame-equipment/instruments/pickers/select-picker';

export interface UnboundFrame {
  readonly _: any;

  readonly get: UnboundGetInstrument;
  readonly detect: UnboundDetectInstrument;

  readonly select: UnboundSelectPicker;
  readonly dispatch: UnboundDispatchPicker;
  readonly exec: UnboundExecPicker;
}

export function createUnboundFrame(cursor: any): UnboundFrame {
  return {
    _: cursor,
    get: unboundGetInstrument,
    detect: undefined!,
    select: unboundSelectPicker,
    dispatch: unboundDispatchPicker,
    exec: unboundExecPicker
  };
}
