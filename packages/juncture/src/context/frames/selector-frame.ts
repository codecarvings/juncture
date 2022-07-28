/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { PrivateFrame } from './private-frame';

export interface SelectorFrame<J extends Juncture> extends PrivateFrame<J> { }

export interface SelectorFrameHost<J extends Juncture> {
  readonly selector: SelectorFrame<J>;
}

export { createPrivateFrame as createSelectorFrame } from './private-frame';

export interface OverrideSelectorFrame<J extends Juncture, S> extends SelectorFrame<J> {
  readonly parent: S;
}
