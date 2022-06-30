/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Cursor, JunctureOfCursor, ValueOfCursor } from '../frame/cursor';
import { CursorOf, Juncture, ValueOf } from '../juncture';
import { PrepareBin, PrivatePrepareBin } from './bin/prepare-bin';
import { PrivateReduceBin, ReduceBin } from './bin/reduce-bin';
import { PrivateSelectBin, SelectBin } from './bin/select-bin';

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

export interface PrivateContext<J extends Juncture> extends PrivateContextRole {
  readonly _ : CursorOf<J>;

  value(): ValueOf<J>;
  value<C extends Cursor>(_: C): ValueOf<JunctureOfCursor<C>>;

  select(): PrivateSelectBin<J>;
  select(_: this['_']): PrivateSelectBin<J>;
  select<C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export interface SelectorContext<J extends Juncture> extends PrivateContext<J> { }

export interface ReducerContext<J extends Juncture> extends PrivateContext<J> {
  reduce(): PrivateReduceBin<J, ValueOf<J>>;
  reduce(_: this['_']): PrivateReduceBin<J, ValueOf<J>>;
  reduce<C extends Cursor>(_: C): ReduceBin<JunctureOfCursor<C>, ValueOfCursor<C>>;
}

export interface MixReducerContext<J extends Juncture> extends ReducerContext<J> {
  prepare(): PrivatePrepareBin<J>;
  prepare(_: this['_']): PrivatePrepareBin<J>;
  prepare<C extends Cursor>(_: C): PrepareBin<JunctureOfCursor<C>>;
}
