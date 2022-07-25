/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { PrivateCursorProvider } from '../cursor';
import { PrivateAccessorKit } from '../kits/accessor-kit';
import { PrivateFrame } from './private-frame';

export interface SelectorFrame<J extends Juncture> extends PrivateFrame<J> { }

export interface SelectorFrameProvider<J extends Juncture> {
  readonly selector: SelectorFrame<J>;
}

export function createSelectorFrame<J extends Juncture>(
  privateCursorProviuder: PrivateCursorProvider<J>,
  accessors: PrivateAccessorKit<J>
): SelectorFrame<J> {
  const frame: any = { };
  defineLazyProperty(frame, '_', () => privateCursorProviuder.privateCursor);
  defineLazyProperty(frame, 'select', () => accessors.select);
  return frame;
}

export interface OverrideSelectorFrame<J extends Juncture, S> extends SelectorFrame<J> {
  readonly parent: S;
}
