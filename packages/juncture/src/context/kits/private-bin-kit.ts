/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createPrivateSelectBin, PrivateSelectBin } from '../../frame/bins/select-bin';
import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { FrameKit } from './frame-kit';

export interface PrivateBinKit<J extends Juncture = Juncture> {
  readonly select: PrivateSelectBin<J>;
}

export function preparePrivateBinKit(privateBins: any, juncture: Juncture, frames: FrameKit) {
  defineLazyProperty(privateBins, 'select', () => createPrivateSelectBin(juncture, frames));
}
