/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  MixReducerContext, OverrideSelectorContext, ReducerContext, SelectorContext
} from '../context/private-context';
import { Juncture } from '../juncture';
import { HandledValueOf } from '../schema-host';
import { jSymbols } from '../symbols';
import { asPrivate, Private } from './private';
import { PropertyAssembler } from './property-assembler';
import {
  Action, createMixReducerDef, createPlainReducerDef, MixReducerDef, PlainReducerDef
} from './reducer';
import {
  createDirectSelectorDef, createParamSelectorDef, DirectSelectorDef, ParamSelectorDef, SelectorOfSelectorDef
} from './selector';

export class PrivateDefComposer<J extends Juncture> {
  constructor(protected readonly juncture: J, protected readonly assembler: PropertyAssembler) { }

  selector<P extends (ctx: SelectorContext<J>) => any>(selectorFn: P): Private<DirectSelectorDef<ReturnType<P>>> {
    return this.assembler.registerProperty(asPrivate(createDirectSelectorDef(selectorFn as any)));
  }

  paramSelector<P extends (ctx: SelectorContext<J>) => (...args: any) => any>(
    selectorFn: P): Private<ParamSelectorDef<ReturnType<P>>> {
    return this.assembler.registerProperty(asPrivate(createParamSelectorDef(selectorFn as any)));
  }

  reducer<P extends (ctx: ReducerContext<J>) => (...args: any) => HandledValueOf<J>>(
    reducerFn: P): Private<PlainReducerDef<ReturnType<P>>> {
    return this.assembler.registerProperty(asPrivate(createPlainReducerDef(reducerFn as any)));
  }

  mixReducer<P extends (ctx: MixReducerContext<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: P): Private<MixReducerDef<ReturnType<P>>> {
    return this.assembler.registerProperty(asPrivate(createMixReducerDef(reducerFn as any)));
  }
}

export class DefComposer<J extends Juncture> {
  constructor(
    protected readonly juncture: J,
    protected readonly assembler: PropertyAssembler = juncture[jSymbols.propertyAssembler]
  ) {
    const overrideMannequin = this.createOverrideMannequin();
    this.override = () => overrideMannequin as any;
  }

  // Since at runtime it's not possible to know the DefKind when override(...) is invoked,
  // this method returs an object with all the possible methods availabe for every DefKind
  protected createOverrideMannequin() {
    const { assembler } = this;
    return {
      selector(selectorFn: any) {
        const def = createDirectSelectorDef(undefined!);
        return assembler.registerProperty(def, (key, parent) => {
          (def as any)[jSymbols.defPayload] = undefined;
        });
      },
      paramSelector(selectorFn: any) {
        const def = createParamSelectorDef(undefined!);
        return assembler.registerProperty(def, (key, parent) => {
          (def as any)[jSymbols.defPayload] = undefined;
        });
      }
    };
  }

  readonly override: {
    <D extends DirectSelectorDef<any>>(parent: D): {
      selector<P extends (ctx: OverrideSelectorContext<J, SelectorOfSelectorDef<D>>) => any>
      (selectorFn: P): DirectSelectorDef<ReturnType<P>>;
    };
    <D extends ParamSelectorDef<any>>(parent: D): {
      paramSelector<P extends (ctx: OverrideSelectorContext<J, SelectorOfSelectorDef<D>>)
      => (...args: any) => any>(
        selectorFn: P): ParamSelectorDef<ReturnType<P>>;
    }
    <D extends PlainReducerDef<any>>(parent: D): 'PLAIN REDUCER';
    <D extends MixReducerDef<any>>(parent: D): 'MIX REDUCER';
  };

  readonly private = new PrivateDefComposer(this.juncture, this.assembler);

  selector<P extends (ctx: SelectorContext<J>) => any>(selectorFn: P): DirectSelectorDef<ReturnType<P>> {
    return this.assembler.registerProperty(createDirectSelectorDef(selectorFn as any));
  }

  paramSelector<P extends (ctx: SelectorContext<J>) => (...args: any) => any>(
    selectorFn: P): ParamSelectorDef<ReturnType<P>> {
    return this.assembler.registerProperty(createParamSelectorDef(selectorFn as any));
  }

  reducer<P extends (ctx: ReducerContext<J>) => (...args: any) => HandledValueOf<J>>(
    reducerFn: P): PlainReducerDef<ReturnType<P>> {
    return this.assembler.registerProperty(createPlainReducerDef(reducerFn as any));
  }

  mixReducer<P extends (ctx: MixReducerContext<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: P): MixReducerDef<ReturnType<P>> {
    return this.assembler.registerProperty(createMixReducerDef(reducerFn as any));
  }
}
