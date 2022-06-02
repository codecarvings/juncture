/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Cursor } from './frame/cursor/cursor';
import { PrivateCursor } from './frame/cursor/private-cursor';
import { selector } from './kernel/selector';

// #region Juncture
export abstract class Juncture {
  defaultValue = selector(this, () => () => true);

  // eslint-disable-next-line class-methods-use-this
  createPrivateCursor(): PrivateCursor<this> {
    // TODO: remove this function
    return undefined!;
  }
}

// ---  Derivations
// TODO: implement cursor
export type CursorOf<J extends Juncture> = Cursor<J>;
export type PrivateCursorOf<J extends Juncture> = ReturnType<J['createPrivateCursor']>;
// #endregion
