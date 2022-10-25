/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../../../driver';
import { Juncture } from '../../../../../juncture';
import { MessageDetectBin, XpMessageDetectBin } from '../../../../bins/detect/message-detect-bin';
import { Cursor, DriverOfCursor } from '../../../cursor';

// #region UnboundMessageDetectPicker
export interface UnboundMessageDetectPicker {
  <C extends Cursor>(_: C): XpMessageDetectBin<DriverOfCursor<C>>;
  <J extends Juncture>(juncture: J): XpMessageDetectBin<InstanceType<J>>;
  <C extends Cursor, J extends Juncture>(_: C, juncture: J): XpMessageDetectBin<InstanceType<J>>;
}
// #endregion

// #region MessageDetectPicker
export interface MessageDetectPicker<D extends Driver> extends UnboundMessageDetectPicker {
  (): MessageDetectBin<D>;
  (_: CursorOf<D>): MessageDetectBin<D>;
}
// #endregion

// #region XpMessageDetectPicker
export interface XpMessageDetectPicker<D extends Driver> extends UnboundMessageDetectPicker {
  (): XpMessageDetectBin<D>;
}
// #endregion
