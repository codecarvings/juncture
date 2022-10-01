/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../../driver';
import { Juncture } from '../../../../juncture';
import { MutationDetectBin, XpMutationDetectBin } from '../../../bins/detect/mutation-detect-bin';
import { Cursor, DriverOfCursor } from '../../cursor';

// #region UnbindedMutationDetectPicker
export interface UnbindedMutationDetectPicker {
  <C extends Cursor>(_: C): XpMutationDetectBin<DriverOfCursor<C>>;
  <J extends Juncture>(juncture: J): XpMutationDetectBin<InstanceType<J>>;
  <C extends Cursor, J extends Juncture>(_: C, juncture: J): XpMutationDetectBin<InstanceType<J>>;
}
// #endregion

// #region MutationDetectPicker
export interface MutationDetectPicker<D extends Driver> extends UnbindedMutationDetectPicker {
  (): MutationDetectBin<D>;
  (_: CursorOf<D>): MutationDetectBin<D>;
}
// #endregion

// #region XpMutationDetectPicker
export interface XpMutationDetectPicker<D extends Driver> extends UnbindedMutationDetectPicker {
  (): XpMutationDetectBin<D>;
}
// #endregion
