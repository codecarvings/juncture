/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver, ValueOf } from '../../../driver';
import { Realm } from '../../realm';
import { getRealm } from '../../realm-host';
import { Cursor, ValueOfCursor } from '../cursor';

// #region UnboundValueInstrument
export interface UnboundValueInstrument {
  <C extends Cursor>(_: C): ValueOfCursor<C>;
}

export function unboundValueInstrument<C extends Cursor>(_: C): ValueOfCursor<C> {
  return getRealm(_).value;
}
// #endregion

// #region ValueInstrument
export interface ValueInstrument<D extends Driver = Driver> extends UnboundValueInstrument {
  (): ValueOf<D>;
}

export interface ValueInstrumentHost<D extends Driver = Driver> {
  readonly value: ValueInstrument<D>;
}

export function createValueInstrument<D extends Driver>(realm: Realm): ValueInstrument<D> {
  return (_?: Cursor) => {
    if (typeof _ !== 'undefined') {
      return getRealm(_).value;
    }
    return realm.value;
  };
}
// #endregion
