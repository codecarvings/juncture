/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MixReducerContext, ReducerContext, SelectorContext } from '../context/private-context';
import { HandledValueOf, Juncture } from '../juncture';
import { registerAssemblableProp } from '../util/assembler';
import { asPrivate, Private } from './private';
import {
  Action, createMixReducerDef, createPlainReducerDef, MixReducerDef, PlainReducerDef
} from './reducer';
import {
  createDirectSelectorDef, createParamSelectorDef, DirectSelectorDef, ParamSelectorDef
} from './selector';

export class PrivateDefComposer<J extends Juncture> {
  constructor(protected readonly juncture: J) { }

  // eslint-disable-next-line class-methods-use-this
  selector<P extends ($: SelectorContext<J>) => any>(selectorFn: P): Private<DirectSelectorDef<ReturnType<P>>> {
    return registerAssemblableProp(this.juncture, asPrivate(createDirectSelectorDef(selectorFn as any)));
  }

  // eslint-disable-next-line class-methods-use-this
  paramSelector<P extends ($: SelectorContext<J>) => (...args: any) => any>(
    selectorFn: P): Private<ParamSelectorDef<ReturnType<P>>> {
    return registerAssemblableProp(this.juncture, asPrivate(createParamSelectorDef(selectorFn as any)));
  }

  // eslint-disable-next-line class-methods-use-this
  reducer<P extends ($: ReducerContext<J>) => (...args: any) => HandledValueOf<J>>(
    reducerFn: P): Private<PlainReducerDef<ReturnType<P>>> {
    return registerAssemblableProp(this.juncture, asPrivate(createPlainReducerDef(reducerFn as any)));
  }

  // eslint-disable-next-line class-methods-use-this
  mixReducer<P extends ($: MixReducerContext<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: P): Private<MixReducerDef<ReturnType<P>>> {
    return registerAssemblableProp(this.juncture, asPrivate(createMixReducerDef(reducerFn as any)));
  }
}

export class DefComposer<J extends Juncture> {
  constructor(protected readonly juncture: J) { }

  readonly private = new PrivateDefComposer(this.juncture);

  override<D extends DirectSelectorDef<any>>(parent: D): any;
  override<D extends ParamSelectorDef<any>>(parent: D): any;
  override<D extends PlainReducerDef<any>>(parent: D): any;
  override<D extends MixReducerDef<any>>(parent: D): any;
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  override(parent: any): any {
    return {};
  }

  // eslint-disable-next-line class-methods-use-this
  selector<P extends ($: SelectorContext<J>) => any>(selectorFn: P): DirectSelectorDef<ReturnType<P>> {
    return registerAssemblableProp(this.juncture, createDirectSelectorDef(selectorFn as any));
  }

  // eslint-disable-next-line class-methods-use-this
  paramSelector<P extends ($: SelectorContext<J>) => (...args: any) => any>(
    selectorFn: P): ParamSelectorDef<ReturnType<P>> {
    return registerAssemblableProp(this.juncture, createParamSelectorDef(selectorFn as any));
  }

  // eslint-disable-next-line class-methods-use-this
  reducer<P extends ($: ReducerContext<J>) => (...args: any) => HandledValueOf<J>>(
    reducerFn: P): PlainReducerDef<ReturnType<P>> {
    return registerAssemblableProp(this.juncture, createPlainReducerDef(reducerFn as any));
  }

  // eslint-disable-next-line class-methods-use-this
  mixReducer<P extends ($: MixReducerContext<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: P): MixReducerDef<ReturnType<P>> {
    return registerAssemblableProp(this.juncture, createMixReducerDef(reducerFn as any));
  }
}
