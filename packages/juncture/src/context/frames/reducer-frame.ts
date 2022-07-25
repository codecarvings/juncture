/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, ValueOf } from '../../juncture';
import { PrivateReduceBin, ReduceBin } from '../bins/reduce-bin';
import { Cursor, JunctureOfCursor, ValueOfCursor } from '../cursor';
import { PrivateFrame } from './private-frame';

export interface ReducerFrame<J extends Juncture> extends PrivateFrame<J> {
  reduce(): PrivateReduceBin<J, ValueOf<J>>;
  reduce(_: this['_']): PrivateReduceBin<J, ValueOf<J>>;
  reduce<C extends Cursor>(_: C): ReduceBin<JunctureOfCursor<C>, ValueOfCursor<C>>;
}

export interface OverrideReducerFrame<J extends Juncture, S> extends ReducerFrame<J> {
  readonly parent: S;
}
