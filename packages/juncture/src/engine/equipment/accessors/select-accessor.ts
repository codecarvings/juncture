/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalCursorOf, Juncture } from '../../../juncture';
import { InternalSelectBin, InternalSelectBinHost, SelectBin } from '../../bins/select-bin';
import { Gear } from '../../gear';
import { createAccessorFactory, createInternalAccessorFactory } from '../accessor';
import { Cursor, JunctureOfCursor } from '../cursor';

// #region SelectAccessor
export interface SelectAccessor<J extends Juncture> {
  (): SelectBin<J>;
  <C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export const createSelectAccessor
: <J extends Juncture>(defaultGear: Gear) => SelectAccessor<J> = createAccessorFactory('select');
// #endregion

// #region InternalSelectAccessor
export interface InternalSelectAccessor<J extends Juncture> {
  (): InternalSelectBin<J>;
  (_: InternalCursorOf<J>): InternalSelectBin<J>;
  <C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export const createInternalSelectAccessor : <J extends Juncture>(
  defaultGear: Gear,
  internalSelectBinHost: InternalSelectBinHost<J>
) => InternalSelectAccessor<J> = createInternalAccessorFactory('select');
// #endregion
