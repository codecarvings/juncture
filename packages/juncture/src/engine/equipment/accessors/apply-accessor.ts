/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalCursorOf, Juncture } from '../../../juncture';
import { ApplyBin, InternalApplyBin, InternalApplyBinHost } from '../../bins/apply-bin';
import { Gear } from '../../gear';
import { createAccessorFactory, createInternalAccessorFactory } from '../accessor';
import { Cursor, JunctureOfCursor } from '../cursor';

// #region ApplyAccessor
export interface ApplyAccessor<J extends Juncture> {
  (): ApplyBin<J>;
  <C extends Cursor>(_: C): ApplyBin<JunctureOfCursor<C>>;
}

export const createApplyAccessor
: <J extends Juncture>(defaultGear: Gear) => ApplyAccessor<J> = createAccessorFactory('apply');
// #endregion

// #region InternalApplyAccessor
export interface InternalApplyAccessor<J extends Juncture> {
  (): InternalApplyBin<J>;
  (_: InternalCursorOf<J>): InternalApplyBin<J>;
  <C extends Cursor>(_: C): ApplyBin<JunctureOfCursor<C>>;
}

export const createInternalApplyAccessor: <J extends Juncture>(
  defaultGear: Gear,
  internalApplyBinHost: InternalApplyBinHost<J>
) => InternalApplyAccessor<J> = createInternalAccessorFactory('apply');
// #endregion
