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
import { UnboundDetectPack } from '../frame-equipment/detect-pack';
import { unboundDispatchPicker } from '../frame-equipment/pickers/dispatch-picker';
import { unboundExecPicker } from '../frame-equipment/pickers/exec-picker';
import { unboundSelectPicker } from '../frame-equipment/pickers/select-picker';
import { unboundValueGetter } from '../frame-equipment/value-accessor';

export interface UnboundFrame {
  readonly _: any;

  readonly detect: UnboundDetectPack;

  value<C extends Cursor>(_: C): ValueOfCursor<C>;

  select<C extends Cursor>(_: C): XpSelectBin<DriverOfCursor<C>>;

  dispatch<C extends Cursor>(_: C): XpDispatchBin<DriverOfCursor<C>>;

  exec<C extends Cursor>(_: C): XpExecBin<DriverOfCursor<C>>;
}

export function createUnboundFrame(cursor: any): UnboundFrame {
  return {
    _: cursor,
    detect: undefined!,
    value: unboundValueGetter,
    select: unboundSelectPicker,
    dispatch: unboundDispatchPicker,
    exec: unboundExecPicker
  };
}
