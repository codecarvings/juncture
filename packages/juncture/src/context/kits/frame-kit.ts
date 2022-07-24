/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSelectorFrame, SelectorFrame } from '../../frame/private-frame';
import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { Cursor } from '../cursor';
import { AccessorKit } from './accessor-kit';

export interface FrameKit<J extends Juncture = Juncture> {
  readonly selector: SelectorFrame<J>;
}

export function prepareFrameKit(frames: any, privateCursor: Cursor, accessors: AccessorKit) {
  defineLazyProperty(frames, 'selector', () => createSelectorFrame(privateCursor, accessors));
}
