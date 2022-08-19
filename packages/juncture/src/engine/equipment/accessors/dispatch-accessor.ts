/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalCursorOf, Juncture } from '../../../juncture';
import { DispatchBin, InternalDispatchBin, InternalDispatchBinHost } from '../../bins/dispatch-bin';
import { Gear } from '../../gear';
import { createAccessorFactory, createInternalAccessorFactory } from '../accessor';
import { Cursor, JunctureOfCursor } from '../cursor';

// #region DispatchAccessor
export interface DispatchAccessor<J extends Juncture> {
  (): DispatchBin<J>;
  <C extends Cursor>(_: C): DispatchBin<JunctureOfCursor<C>>;
}

export const createDispatchAccessor
: <J extends Juncture>(defaultGear: Gear) => DispatchAccessor<J> = createAccessorFactory('dispatch');
// #endregion

// #region InternalDispatchAccessor
export interface InternalDispatchAccessor<J extends Juncture> {
  (): InternalDispatchBin<J>;
  (_: InternalCursorOf<J>): InternalDispatchBin<J>;
  <C extends Cursor>(_: C): DispatchBin<JunctureOfCursor<C>>;
}

export const createInternalDispatchAccessor: <J extends Juncture>(
  defaultGear: Gear,
  internalDispatchBinHost: InternalDispatchBinHost<J>
) => InternalDispatchAccessor<J> = createInternalAccessorFactory('dispatch');
// #endregion
