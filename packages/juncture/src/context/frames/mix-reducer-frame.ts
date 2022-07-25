/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { PrepareBin, PrivatePrepareBin } from '../bins/prepare-bin';
import { Cursor, JunctureOfCursor } from '../cursor';
import { PrivateFrame } from './private-frame';

export interface MixReducerFrame<J extends Juncture> extends PrivateFrame<J> {
  prepare(): PrivatePrepareBin<J>;
  prepare(_: this['_']): PrivatePrepareBin<J>;
  prepare<C extends Cursor>(_: C): PrepareBin<JunctureOfCursor<C>>;
}

export interface OverrideMixReducerFrame<J extends Juncture, S> extends MixReducerFrame<J> {
  readonly parent: S;
}
