/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Cursor, JunctureOfCursor } from '../frame/cursor';
import { CursorOf, Juncture, ValueOf } from '../juncture';
import { PrivateSelectBin } from './select-bin';

// --- Symbols
const privateContextSymbol = Symbol('privateContext');

interface PrivateContextSymbols {
  readonly privateContext: typeof privateContextSymbol;
}
const privateContextSymbols: PrivateContextSymbols = {
  privateContext: privateContextSymbol
};

export interface PrivateContextRole {
  readonly [privateContextSymbols.privateContext]: true;
}

interface PrivateContext<J extends Juncture> extends PrivateContextRole {
  readonly _: CursorOf<J>;

  value(): ValueOf<J>;
  value<C extends Cursor<any>>(_: C): ValueOf<JunctureOfCursor<C>>;

  select(): PrivateSelectBin<J>;
  select<C extends Cursor<any>>(_: C): PrivateSelectBin<JunctureOfCursor<C>>;
}

export interface SelectorContext<J extends Juncture> extends PrivateContext<J> { }

export interface ReactorContext<J extends Juncture> extends PrivateContext<J> { }
