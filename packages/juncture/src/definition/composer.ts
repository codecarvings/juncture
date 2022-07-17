/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  MixReducerContext, OverrideMixReducerContext, OverrideReducerContext,
  OverrideSelectorContext, ReducerContext, SelectorContext
} from '../context/private-context';
import { Juncture } from '../juncture';
import { HandledValueOf } from '../schema-host';
import { jSymbols } from '../symbols';
import { Def, isDef } from './def';
import {
  asPrivate, isPrivate, Private, SameAccess
} from './private';
import { PropertyAssembler } from './property-assembler';
import {
  Action, createMixReducerDef, createPlainReducerDef, isMixReducerDef,
  isPlainReducerDef, MixReducerDef, PlainReducerDef, ReducerOfReducerDef
} from './reducer';
import {
  createDirectSelectorDef, createParamSelectorDef, DirectSelectorDef,
  isDirectSelectorDef, isParamSelectorDef, ParamSelectorDef, SelectorOfSelectorDef
} from './selector';

export interface CreateDefForOverrideArgs {
  readonly key: string;
  readonly parentDef: Def<any, any, any>;
  readonly fnName: string;
  readonly fnArgs: any[]
}

export class PrivateDefComposer<J extends Juncture> {
  constructor(protected readonly juncture: J, protected readonly assembler: PropertyAssembler) { }

  selector<P extends (ctx: SelectorContext<J>) => any>(selectorFn: P): Private<DirectSelectorDef<ReturnType<P>>> {
    return this.assembler.registerStaticProperty(asPrivate(createDirectSelectorDef(selectorFn as any)));
  }

  paramSelector<P extends (ctx: SelectorContext<J>) => (...args: any) => any>(
    selectorFn: P): Private<ParamSelectorDef<ReturnType<P>>> {
    return this.assembler.registerStaticProperty(asPrivate(createParamSelectorDef(selectorFn as any)));
  }

  reducer<P extends (ctx: ReducerContext<J>) => (...args: any) => HandledValueOf<J>>(
    reducerFn: P): Private<PlainReducerDef<ReturnType<P>>> {
    return this.assembler.registerStaticProperty(asPrivate(createPlainReducerDef(reducerFn as any)));
  }

  mixReducer<P extends (ctx: MixReducerContext<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: P): Private<MixReducerDef<ReturnType<P>>> {
    return this.assembler.registerStaticProperty(asPrivate(createMixReducerDef(reducerFn as any)));
  }
}

export class DefComposer<J extends Juncture> {
  constructor(
    protected readonly juncture: J,
    protected readonly assembler: PropertyAssembler = juncture[jSymbols.propertyAssembler]
  ) { }

  // eslint-disable-next-line class-methods-use-this
  protected createOverrideProxy(): any {
    const { assembler } = this;
    const createDefForOverride = this.createDefForOverride.bind(this);
    let revoke: () => void;
    const target = {};
    const handler: ProxyHandler<typeof target> = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      get(_target, fnName) {
        return (...fnArgs: any) => assembler.registerDynamicProperty((key, parentDef) => {
          if (revoke) {
            revoke();
          }
          if (parentDef === undefined) {
            throw Error(`Unable to override property "${key}" (no parent found)`);
          }
          if (!isDef(parentDef)) {
            throw Error(`Unable to override property "${key}" (parent is not a Def)`);
          }
          const newDef = createDefForOverride({
            key, parentDef, fnName, fnArgs
          } as any);
          if (isPrivate(parentDef)) {
            return asPrivate(newDef);
          }
          return newDef;
        });
      }
    };

    let result: any;
    if (Proxy.revocable) {
      const revocable = Proxy.revocable(target, handler);
      revoke = revocable.revoke;
      result = revocable.proxy;
    } else {
      result = new Proxy(target, handler);
    }
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  protected createDefForOverride(args: CreateDefForOverrideArgs): Def<any, any, any> {
    if (isDirectSelectorDef(args.parentDef)) {
      if (args.fnName === 'selector') {
        return createDirectSelectorDef(ctx => {
          const parent = args.parentDef[jSymbols.defPayload](ctx);
          const ctx2 = { ...ctx, parent };
          return args.fnArgs[0](ctx2);
        });
      }
    }

    if (isParamSelectorDef(args.parentDef)) {
      if (args.fnName === 'paramSelector') {
        return createParamSelectorDef(ctx => {
          const parent = args.parentDef[jSymbols.defPayload](ctx);
          const ctx2 = { ...ctx, parent };
          return args.fnArgs[0](ctx2);
        });
      }
    }

    if (isPlainReducerDef(args.parentDef)) {
      if (args.fnName === 'reducer') {
        return createPlainReducerDef(ctx => {
          const parent = args.parentDef[jSymbols.defPayload](ctx);
          const ctx2 = { ...ctx, parent };
          return args.fnArgs[0](ctx2);
        });
      }
    }

    if (isMixReducerDef(args.parentDef)) {
      if (args.fnName === 'mixReducer') {
        return createMixReducerDef(ctx => {
          const parent = args.parentDef[jSymbols.defPayload](ctx);
          const ctx2 = { ...ctx, parent };
          return args.fnArgs[0](ctx2);
        });
      }
    }

    // eslint-disable-next-line max-len
    throw Error(`Unable to override defKind "${args.parentDef.defKind}" for property "${args.key}" with ${args.fnName}(...)`);
  }

  // eslint-disable-next-line class-methods-use-this
  readonly override: {
    <D extends DirectSelectorDef<any>>(parent : D): {
      selector<P extends (ctx: OverrideSelectorContext<J, SelectorOfSelectorDef<D>>) => any>
      (selectorFn: P): SameAccess<D, DirectSelectorDef<ReturnType<P>>>;
    };

    <D extends ParamSelectorDef<any>>(parent: D): {
      paramSelector<P extends (ctx: OverrideSelectorContext<J, SelectorOfSelectorDef<D>>)
      => (...args: any) => any>(
        selectorFn: P): SameAccess<D, ParamSelectorDef<ReturnType<P>>>;
    };

    <D extends PlainReducerDef<any>>(parent: D): {
      reducer<P extends (ctx: OverrideReducerContext<J, ReducerOfReducerDef<D>>)
      => (...args: any) => HandledValueOf<J>>(
        reducerFn: P): SameAccess<D, PlainReducerDef<ReturnType<P>>>
    };

    <D extends MixReducerDef<any>>(parent: D): {
      mixReducer<P extends (ctx: OverrideMixReducerContext<J, ReducerOfReducerDef<D>>)
      => (...args: any) => ReadonlyArray<Action>>(
        reducerFn: P): SameAccess<D, MixReducerDef<ReturnType<P>>>
    };
  } = this.createOverrideProxy;

  readonly private = new PrivateDefComposer(this.juncture, this.assembler);

  selector<P extends (ctx: SelectorContext<J>) => any>(selectorFn: P): DirectSelectorDef<ReturnType<P>> {
    return this.assembler.registerStaticProperty(createDirectSelectorDef(selectorFn as any));
  }

  paramSelector<P extends (ctx: SelectorContext<J>) => (...args: any) => any>(
    selectorFn: P): ParamSelectorDef<ReturnType<P>> {
    return this.assembler.registerStaticProperty(createParamSelectorDef(selectorFn as any));
  }

  reducer<P extends (ctx: ReducerContext<J>) => (...args: any) => HandledValueOf<J>>(
    reducerFn: P): PlainReducerDef<ReturnType<P>> {
    return this.assembler.registerStaticProperty(createPlainReducerDef(reducerFn as any));
  }

  mixReducer<P extends (ctx: MixReducerContext<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: P): MixReducerDef<ReturnType<P>> {
    return this.assembler.registerStaticProperty(createMixReducerDef(reducerFn as any));
  }
}
