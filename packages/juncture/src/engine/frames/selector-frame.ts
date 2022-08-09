/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { InternalFrame } from './internal-frame';

export interface SelectorFrame<J extends Juncture> extends InternalFrame<J> { }

export interface SelectorFrameHost<J extends Juncture> {
  readonly selector: SelectorFrame<J>;
}

export { createInternalFrame as createSelectorFrame } from './internal-frame';

export interface OverrideSelectorFrame<J extends Juncture, S> extends SelectorFrame<J> {
  readonly parent: S;
}
