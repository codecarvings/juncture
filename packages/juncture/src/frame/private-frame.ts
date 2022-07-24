/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Cursor, JunctureOfCursor, ValueOfCursor } from '../context/cursor';
import { AccessorKit } from '../context/kits/accessor-kit';
import { Juncture, PrivateCursorOf, ValueOf } from '../juncture';
import { defineLazyProperty } from '../util/object';
import { PrepareBin, PrivatePrepareBin } from './bins/prepare-bin';
import { PrivateReduceBin, ReduceBin } from './bins/reduce-bin';
import { PrivateSelectBin, SelectBin } from './bins/select-bin';

// --- Symbols
const privateFrameSymbol = Symbol('privateFrame');

interface PrivateFrameSymbols {
  readonly privateFrame: typeof privateFrameSymbol;
}
const privateFrameSymbols: PrivateFrameSymbols = {
  privateFrame: privateFrameSymbol
};

export interface PrivateFrameConsumer<B> {
  (frame: PrivateFrameRole): B;
}

interface PrivateFrameRole {
  readonly [privateFrameSymbols.privateFrame]: true;
}

export interface PrivateFrame<J extends Juncture> extends PrivateFrameRole {
  readonly _ : PrivateCursorOf<J>;

  value(): ValueOf<J>;
  value<C extends Cursor>(_: C): ValueOf<JunctureOfCursor<C>>;

  select(): PrivateSelectBin<J>;
  select(_: this['_']): PrivateSelectBin<J>;
  select<C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export interface SelectorFrame<J extends Juncture> extends PrivateFrame<J> { }

export function createSelectorFrame<J extends Juncture>(
  privateCursor: PrivateCursorOf<J>,
  accessors: AccessorKit<J>
): SelectorFrame<J> {
  const frame: any = { };
  defineLazyProperty(frame, '_', () => privateCursor);
  defineLazyProperty(frame, 'select', () => accessors.select);
  return frame;
}

export interface OverrideSelectorFrame<J extends Juncture, S> extends SelectorFrame<J> {
  readonly parent: S;
}

export interface ReducerFrame<J extends Juncture> extends PrivateFrame<J> {
  reduce(): PrivateReduceBin<J, ValueOf<J>>;
  reduce(_: this['_']): PrivateReduceBin<J, ValueOf<J>>;
  reduce<C extends Cursor>(_: C): ReduceBin<JunctureOfCursor<C>, ValueOfCursor<C>>;
}

export interface OverrideReducerFrame<J extends Juncture, S> extends ReducerFrame<J> {
  readonly parent: S;
}

export interface MixReducerFrame<J extends Juncture> extends ReducerFrame<J> {
  prepare(): PrivatePrepareBin<J>;
  prepare(_: this['_']): PrivatePrepareBin<J>;
  prepare<C extends Cursor>(_: C): PrepareBin<JunctureOfCursor<C>>;
}

export interface OverrideMixReducerFrame<J extends Juncture, S> extends MixReducerFrame<J> {
  readonly parent: S;
}

export interface OverrideSchemaFrame<S> {
  readonly parent: S;
}
