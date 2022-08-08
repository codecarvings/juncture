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

export type ParamSelectorDefAccess = DefAccess.public | DefAccess.private;

export interface ParamSelectorDef<B extends (...args: any) => any, A extends ParamSelectorDefAccess>
  extends Def<DefType.paramSelector, InternalFrameConsumer<B>, A> { }

export interface PubParamSelectorDef<B extends (...args: any) => any>
  extends ParamSelectorDef<B, DefAccess.public> { }

export interface PrvParamSelectorDef<B extends (...args: any) => any>
  extends ParamSelectorDef<B, DefAccess.private> { }

export function createParamSelectorDef<B extends (...args: any) => any>(
  selectorFn: InternalFrameConsumer<B>): PubParamSelectorDef<B>;
export function createParamSelectorDef<B extends (...args: any) => any>(
  selectorFn: InternalFrameConsumer<B>, access: DefAccess.public): PubParamSelectorDef<B>;
export function createParamSelectorDef<B extends (...args: any) => any>(
  selectorFn: InternalFrameConsumer<B>, access: DefAccess.private): PrvParamSelectorDef<B>;
export function createParamSelectorDef<B extends (...args: any) => any>(
  selectorFn: InternalFrameConsumer<B>, access: ParamSelectorDefAccess = DefAccess.public) {
  return createDef(DefType.paramSelector, selectorFn, access);
}

// ---  Derivations
export type ParamSelectorOfParamSelectorDef<D extends ParamSelectorDef<any, any>>
   = D extends ParamSelectorDef<infer B, any> ? B : never;
