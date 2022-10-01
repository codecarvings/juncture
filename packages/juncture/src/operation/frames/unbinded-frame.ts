/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { XpDispatchBin } from '../bins/dispatch-bin';
import { XpExecBin } from '../bins/exec-bin';
import { XpSelectBin } from '../bins/select-bin';
import {
    Cursor, DriverOfCursor, ValueOfCursor
} from '../frame-equipment/cursor';
import { UnbindedDetectPack } from '../frame-equipment/detect-pack';
import { unbindedDispatchPicker } from '../frame-equipment/pickers/dispatch-picker';
import { unbindedExecPicker } from '../frame-equipment/pickers/exec-picker';
import { unbindedSelectPicker } from '../frame-equipment/pickers/select-picker';
import { unbindedValueGetter } from '../frame-equipment/value-accessor';

export interface UnbindedFrame {
  readonly _: any;

  readonly detect: UnbindedDetectPack;

  value<C extends Cursor>(_: C): ValueOfCursor<C>;

  select<C extends Cursor>(_: C): XpSelectBin<DriverOfCursor<C>>;

  dispatch<C extends Cursor>(_: C): XpDispatchBin<DriverOfCursor<C>>;

  exec<C extends Cursor>(_: C): XpExecBin<DriverOfCursor<C>>;
}

export function createUnbindedFrame(cursor: any): UnbindedFrame {
  return {
    _: cursor,
    detect: undefined!,
    value: unbindedValueGetter,
    select: unbindedSelectPicker,
    dispatch: unbindedDispatchPicker,
    exec: unbindedExecPicker
  };
}
