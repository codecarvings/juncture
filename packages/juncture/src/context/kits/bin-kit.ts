/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import {
  createPrivateSelectBin, createSelectBin, PrivateSelectBin, SelectBin
} from '../bins/select-bin';
import { PrivateFrameKit } from './frame-kit';

// #region BinKit
export interface BinKit<J extends Juncture = Juncture> {
  readonly select: SelectBin<J>;
}

export function prepareBinKit(bins: any, juncture: Juncture, frames: PrivateFrameKit) {
  defineLazyProperty(bins, 'select', () => createSelectBin(juncture, frames));
}
// #endregion

// #region PrivateBinKit
export interface PrivateBinKit<J extends Juncture = Juncture> {
  readonly select: PrivateSelectBin<J>;
}

export function preparePrivateBinKit(privateBins: any, juncture: Juncture, frames: PrivateFrameKit) {
  defineLazyProperty(privateBins, 'select', () => createPrivateSelectBin(juncture, frames));
}
// #endregion
