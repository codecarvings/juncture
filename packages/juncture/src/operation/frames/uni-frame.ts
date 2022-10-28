/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { UniCheckInstrument } from '../frame-equipment/instruments/check-instrument';
import { UniDetectInstrument } from '../frame-equipment/instruments/detect-instrument';
import { uniGetInstrument, UniGetInstrument } from '../frame-equipment/instruments/get-instrument';
import { uniDispatchPicker, UniDispatchPicker } from '../frame-equipment/instruments/pickers/dispatch-picker';
import { uniExecPicker, UniExecPicker } from '../frame-equipment/instruments/pickers/exec-picker';
import { uniSelectPicker, UniSelectPicker } from '../frame-equipment/instruments/pickers/select-picker';

export interface UniFrame {
  readonly _: any;

  readonly check: UniCheckInstrument;
  readonly get: UniGetInstrument;
  readonly detect: UniDetectInstrument;

  readonly select: UniSelectPicker;
  readonly dispatch: UniDispatchPicker;
  readonly exec: UniExecPicker;
}

export function createUniFrame(cursor: any): UniFrame {
  return {
    _: cursor,
    check: undefined!,
    get: uniGetInstrument,
    detect: undefined!,
    select: uniSelectPicker,
    dispatch: uniDispatchPicker,
    exec: uniExecPicker
  };
}
