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
export interface UnboundGetInstrument {
  <C extends Cursor>(_: C): ValueOfCursor<C>;
}

export function unboundGetInstrument<C extends Cursor>(_: C): ValueOfCursor<C> {
  return getRealm(_).value;
}
// #endregion

// #region ValueInstrument
export interface GetInstrument<D extends Driver = Driver> extends UnboundGetInstrument {
  (): ValueOf<D>;
}

export interface GetInstrumentHost<D extends Driver = Driver> {
  readonly get: GetInstrument<D>;
}

export function createGetInstrument<D extends Driver>(realm: Realm): GetInstrument<D> {
  return (_?: Cursor) => {
    if (typeof _ !== 'undefined') {
      return getRealm(_).value;
    }
    return realm.value;
  };
}
// #endregion
