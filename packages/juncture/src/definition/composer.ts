/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BareJuncture, HandledValueOf } from '../bare-juncture';
import {
  MixReducerContext, OverrideMixReducerContext, OverrideReducerContext,
  OverrideSelectorContext, ReducerContext, SelectorContext
} from '../context/private-context';
import { Juncture } from '../juncture';
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

export class PrivateDefComposer<J extends BareJuncture> {
  constructor(protected readonly juncture: J, protected readonly assembler: PropertyAssembler) { }

  selector<F extends (ctx: SelectorContext<J>) => any>(selectorFn: F): Private<DirectSelectorDef<ReturnType<F>>> {
    return this.assembler.registerStaticProperty(asPrivate(createDirectSelectorDef(selectorFn as any)));
  }

  paramSelector<F extends (ctx: SelectorContext<J>) => (...args: any) => any>(
    selectorFn: F): Private<ParamSelectorDef<ReturnType<F>>> {
    return this.assembler.registerStaticProperty(asPrivate(createParamSelectorDef(selectorFn as any)));
  }

  reducer<F extends (ctx: ReducerContext<J>) => (...args: any) => HandledValueOf<J>>(
    reducerFn: F): Private<PlainReducerDef<ReturnType<F>>> {
    return this.assembler.registerStaticProperty(asPrivate(createPlainReducerDef(reducerFn as any)));
  }

  mixReducer<F extends (ctx: MixReducerContext<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): Private<MixReducerDef<ReturnType<F>>> {
    return this.assembler.registerStaticProperty(asPrivate(createMixReducerDef(reducerFn as any)));
  }
}

export class BareDefComposer<J extends BareJuncture> {
  constructor(protected readonly juncture: J, protected readonly assembler: PropertyAssembler) { }

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
      selector<F extends (ctx: OverrideSelectorContext<J, SelectorOfSelectorDef<D>>) => any>
      (selectorFn: F): SameAccess<D, DirectSelectorDef<ReturnType<F>>>;
    };

    <D extends ParamSelectorDef<any>>(parent: D): {
      paramSelector<F extends (ctx: OverrideSelectorContext<J, SelectorOfSelectorDef<D>>)
      => (...args: any) => any>(
        selectorFn: F): SameAccess<D, ParamSelectorDef<ReturnType<F>>>;
    };

    <D extends PlainReducerDef<any>>(parent: D): {
      reducer<F extends (ctx: OverrideReducerContext<J, ReducerOfReducerDef<D>>)
      => (...args: any) => HandledValueOf<J>>(
        reducerFn: F): SameAccess<D, PlainReducerDef<ReturnType<F>>>
    };

    <D extends MixReducerDef<any>>(parent: D): {
      mixReducer<F extends (ctx: OverrideMixReducerContext<J, ReducerOfReducerDef<D>>)
      => (...args: any) => ReadonlyArray<Action>>(
        reducerFn: F): SameAccess<D, MixReducerDef<ReturnType<F>>>
    };
  } = this.createOverrideProxy;

  readonly private = new PrivateDefComposer(this.juncture, this.assembler);

  selector<F extends (ctx: SelectorContext<J>) => any>(selectorFn: F): DirectSelectorDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createDirectSelectorDef(selectorFn as any));
  }

  paramSelector<F extends (ctx: SelectorContext<J>) => (...args: any) => any>(
    selectorFn: F): ParamSelectorDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createParamSelectorDef(selectorFn as any));
  }

  reducer<F extends (ctx: ReducerContext<J>) => (...args: any) => HandledValueOf<J>>(
    reducerFn: F): PlainReducerDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createPlainReducerDef(reducerFn as any));
  }

  mixReducer<F extends (ctx: MixReducerContext<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): MixReducerDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createMixReducerDef(reducerFn as any));
  }
}

export class DefComposer<J extends Juncture> extends BareDefComposer<J> {
  constructor(juncture: J) {
    super(juncture, Juncture.getPropertyAssembler(juncture));
  }
}
