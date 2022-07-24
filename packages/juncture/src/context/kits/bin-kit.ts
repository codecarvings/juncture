/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSelectBin, SelectBin } from '../../frame/bins/select-bin';
import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { FrameKit } from './frame-kit';

export interface BinKit<J extends Juncture = Juncture> {
  readonly select: SelectBin<J>;
}

export function prepareBinKit(bins: any, juncture: Juncture, frames: FrameKit) {
  defineLazyProperty(bins, 'select', () => createSelectBin(juncture, frames));
}
