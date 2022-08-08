/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalFrameConsumer } from '../context/frames/internal-frame';
import {
  createDef, Def, DefAccess, DefType
} from './def';

type SelectorDefAccess = DefAccess.public | DefAccess.private;

export interface SelectorDef<B, A extends SelectorDefAccess>
  extends Def<DefType.selector, InternalFrameConsumer<B>, A> { }

export interface PubSelectorDef<B> extends SelectorDef<B, DefAccess.public> { }

export interface PrvSelectorDef<B> extends SelectorDef<B, DefAccess.private> { }

export function createSelectorDef
  <B>(selectorFn: InternalFrameConsumer<B>): PubSelectorDef<B>;
export function createSelectorDef
  <B>(selectorFn: InternalFrameConsumer<B>, access: DefAccess.public): PubSelectorDef<B>;
export function createSelectorDef
  <B>(selectorFn: InternalFrameConsumer<B>, access: DefAccess.private): PrvSelectorDef<B>;
export function createSelectorDef<B>(
  selectorFn: InternalFrameConsumer<B>,
  access: SelectorDefAccess = DefAccess.public
) {
  return createDef(DefType.selector, selectorFn, access);
}

// ---  Derivations
export type SelectorOfSelectorDef<D extends SelectorDef<any, any>>
  = D extends SelectorDef<infer B, any> ? B : never;
