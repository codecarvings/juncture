/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver, ValueOf } from '../../../driver';
import { Instruction } from '../../instruction';
import { Realm } from '../../realm';
import { getRealm } from '../../realm-host';
import { Cursor, ValueOfCursor } from '../cursor';

// #region SetInstrument
export interface SetInstrument<D extends Driver = Driver> {
  (value: ValueOf<D>): Instruction;
  <C extends Cursor>(_: C, value: ValueOfCursor<C>): Instruction;
}

export interface SetInstrumentHost<D extends Driver = Driver> {
  readonly set: SetInstrument<D>;
}

export function createSetInstrument<D extends Driver>(realm: Realm): SetInstrument<D> {
  const result = (...args: any) => {
    if (args.length > 1) {
      return { target: getRealm(args[0]), payload: args[1] };
    }
    return { target: realm, payload: args[0] };
  };
  return result as any;
}
// #endregion
