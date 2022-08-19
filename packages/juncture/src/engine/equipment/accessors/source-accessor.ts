/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalCursorOf, Juncture } from '../../../juncture';
import { InternalSourceBin, SourceBin } from '../../bins/source-bin';
import { Gear } from '../../gear';
import { Cursor, JunctureOfCursor } from '../cursor';

// #region SourceAccessor
export interface SourceAccessor<J extends Juncture> {
  (): SourceBin<J>;
  <C extends Cursor>(_: C): SourceBin<JunctureOfCursor<C>>;
}

// TODO: IMPLEMENT THIS
export const createSourceAccessor
: <J extends Juncture>(defaultGear: Gear) => SourceAccessor<J> = undefined!;
// #endregion

// #region InternalSourceAccessor
export interface InternalSourceAccessor<J extends Juncture> {
  (): InternalSourceBin<J>;
  (_: InternalCursorOf<J>): InternalSourceBin<J>;
  <C extends Cursor>(_: C): SourceBin<JunctureOfCursor<C>>;
}

// TODO: IMPLEMENT THIS
export const createInternalSourceAccessor: <J extends Juncture>(
  defaultGear: Gear,
) => InternalSourceAccessor<J> = undefined!;
// #endregion
