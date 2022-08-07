/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalFrameConsumer } from '../context/frames/internal-frame';
import {
  createDef, Def, DefAccess, DefType, isDef
} from './def';

export type ReactorDef<B extends (() => void) | void = (() => void) | void>
  = Def<DefType.reactor, DefAccess.private, InternalFrameConsumer<B>>;

export type SafeReactorDef = ReactorDef<void>;
export type DisposableReactorDef = ReactorDef<() => void>;

export function createReactorDef<B extends (() => void) | void>(
  reactorFn: InternalFrameConsumer<B>): B extends void ? SafeReactorDef : DisposableReactorDef {
  return createDef(DefType.reactor, DefAccess.private, reactorFn) as any;
}

export function isReactorDef(obj: any): obj is ReactorDef {
  return isDef(obj, DefType.reactor, DefAccess.private);
}

// ---  Derivations
export type ReactorOfReactorDef<D extends ReactorDef<any>> = D extends ReactorDef<infer B> ? B : never;
