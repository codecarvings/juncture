/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ActiveQuery } from '../../query/active-query';
import { XpSelectBin } from '../bins/select-bin';
import { ActiveQueryCursor } from '../frame-equipment/active-query-cursor';
import { Cursor } from '../frame-equipment/cursor';
import { unboundDispatchPicker } from '../frame-equipment/pickers/dispatch-picker';
import { unboundExecPicker } from '../frame-equipment/pickers/exec-picker';
import { createActiveQueryValueGetter } from '../frame-equipment/value-accessor';
import { getRealm } from '../realm-host';
import { UnboundFrame } from './unbound-frame';

export interface ActiveQueryFrame<Q extends ActiveQuery> extends UnboundFrame {
  readonly _: ActiveQueryCursor<Q>;
}

export interface ActiveQuerySelectionInspector {
  (isStart: boolean): void
}

export function createActiveQueryFrame<Q extends ActiveQuery>(
  cursor: ActiveQueryCursor<Q>,
  inspector: ActiveQuerySelectionInspector
): ActiveQueryFrame<Q> {
  const value = createActiveQueryValueGetter(inspector);

  const selectBins = new WeakMap<Cursor, XpSelectBin<any>>();
  const select = (_: Cursor) => {
    const result = selectBins.get(_);
    if (result) {
      return result;
    }
    const selectBin = getRealm(_).xpBins.createActiveQuerySelectBin(inspector);
    selectBins.set(_, selectBin);
    return selectBin;
  };

  return {
    _: cursor,
    detect: undefined!,
    value,
    select,
    dispatch: unboundDispatchPicker,
    exec: unboundExecPicker
  };
}
