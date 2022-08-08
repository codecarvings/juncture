/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Action } from './context/action';
import { OverrideReactorFrame, ReactorFrame } from './context/frames/reactor-frame';
import { OverrideReducerFrame, ReducerFrame } from './context/frames/reducer-frame';
import { OverrideSelectorFrame, SelectorFrame } from './context/frames/selector-frame';
import { OverrideTriggerFrame, TriggerFrame } from './context/frames/trigger-frame';
import {
  Def, DefAccess, DefType, isDef
} from './definition/def';
import {
  createParamSelectorDef, ParamSelectorDef, ParamSelectorOfParamSelectorDef, PrvParamSelectorDef, PubParamSelectorDef
} from './definition/param-selector';
import {
  createReactorDef, DisposableReactorDef, ReactorDef, ReactorOfReactorDef, SafeReactorDef
} from './definition/reactor';
import {
  createReducerDef, PrtReducerDef, PrvReducerDef, PubReducerDef, ReducerDef, ReducerOfReducerDef
} from './definition/reducer';
import {
  createSelectorDef, PrvSelectorDef, PubSelectorDef, SelectorDef, SelectorOfSelectorDef
} from './definition/selector';
import {
  createTriggerDef, PrtTriggerDef, PrvTriggerDef, PubTriggerDef, TriggerDef, TriggerOfTriggerDef
} from './definition/trigger';
import { PropertyAssembler } from './fabric/property-assembler';
import { Juncture, ValueOf } from './juncture';
import { jSymbols } from './symbols';
import { OverloadParameters } from './util/overloaed-function-types';

export interface CreateDefForOverrideArgs {
  readonly key: string;
  readonly parentDef: Def<any, any, any>;
  readonly fnName: string;
  readonly fnArgs: any[]
}

// #region ProtectedForger
export class ProtectedForger<J extends Juncture> {
  constructor(protected readonly assembler: PropertyAssembler) { }

  reducer<F extends (frame: ReducerFrame<J>) => (...args: any) => ValueOf<J>>(
    reducerFn: F): PrtReducerDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createReducerDef(reducerFn as any, DefAccess.protected));
  }

  trigger<F extends (frame: TriggerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): PrtTriggerDef<(...args : OverloadParameters<ReturnType<F>>) => Action[]> {
    const fn: any = reducerFn || (() => () => []);
    return this.assembler.registerStaticProperty(createTriggerDef(fn, DefAccess.protected));
  }
}
// #endregion

// #region PrivateForger
export class PrivateForger<J extends Juncture> {
  constructor(protected readonly assembler: PropertyAssembler) { }

  selector<F extends (frame: SelectorFrame<J>) => any>(selectorFn: F): PrvSelectorDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createSelectorDef(selectorFn as any, DefAccess.private));
  }

  paramSelector<F extends (frame: SelectorFrame<J>) => (...args: any) => any>(
    selectorFn: F): PrvParamSelectorDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createParamSelectorDef(selectorFn as any, DefAccess.private));
  }

  reducer<F extends (frame: ReducerFrame<J>) => (...args: any) => ValueOf<J>>(
    reducerFn: F): PrvReducerDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createReducerDef(reducerFn as any, DefAccess.private));
  }

  trigger<F extends (frame: TriggerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): PrvTriggerDef<(...args : OverloadParameters<ReturnType<F>>) => Action[]> {
    const fn: any = reducerFn || (() => () => []);
    return this.assembler.registerStaticProperty(createTriggerDef(fn, DefAccess.private));
  }
}
// #endregion

// #region Forger
export class Forger<J extends Juncture> {
  constructor(protected readonly assembler: PropertyAssembler) { }

  // eslint-disable-next-line class-methods-use-this
  protected createOverrideProxy(): any {
    const { assembler } = this;
    const createDefForOverride = this.createDefForOverride.bind(this);
    let revoke: () => void;
    const target = {};
    const handler: ProxyHandler<typeof target> = {
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
          return createDefForOverride({
            key, parentDef, fnName, fnArgs
          } as any);
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
    switch (args.parentDef.type) {
      case DefType.selector:
        if (args.fnName === 'selector') {
          return createSelectorDef(frame => {
            const parent = args.parentDef[jSymbols.defPayload](frame);
            const frame2 = { ...frame, parent };
            return args.fnArgs[0](frame2);
          }, args.parentDef.access);
        }
        break;
      case DefType.paramSelector:
        if (args.fnName === 'paramSelector') {
          return createParamSelectorDef(frame => {
            const parent = args.parentDef[jSymbols.defPayload](frame);
            const frame2 = { ...frame, parent };
            return args.fnArgs[0](frame2);
          }, args.parentDef.access);
        }
        break;
      case DefType.reducer:
        if (args.fnName === 'reducer') {
          return createReducerDef(frame => {
            const parent = args.parentDef[jSymbols.defPayload](frame);
            const frame2 = { ...frame, parent };
            return args.fnArgs[0](frame2);
          }, args.parentDef.access);
        }
        break;
      case DefType.trigger:
        if (args.fnName === 'trigger') {
          return createTriggerDef(frame => {
            const parent = args.parentDef[jSymbols.defPayload](frame);
            const frame2 = { ...frame, parent };
            return args.fnArgs[0](frame2);
          }, args.parentDef.access);
        }
        break;
      default:
        break;
    }

    throw Error(`Unable to override DefType "${args.parentDef.type}" for property "${args.key}" with ${args.fnName}(...)`);
  }

  // eslint-disable-next-line class-methods-use-this
  readonly override: {
    <D extends SelectorDef<any, any>>(parent : D): {
      selector<F extends (frame: OverrideSelectorFrame<J, SelectorOfSelectorDef<D>>) => any>
      (selectorFn: F): D extends Def<any, any, DefAccess.public> ? PubSelectorDef<ReturnType<F>> : PrvSelectorDef<ReturnType<F>>;
    };

    <D extends ParamSelectorDef<any, any>>(parent: D): {
      paramSelector<F extends (frame: OverrideSelectorFrame<J, ParamSelectorOfParamSelectorDef<D>>)
      => (...args: any) => any>(
        selectorFn: F): D extends Def<any, any, DefAccess.public> ? PubParamSelectorDef<ReturnType<F>> : PrvParamSelectorDef<ReturnType<F>>;
    };

    <D extends ReducerDef<any, any>>(parent: D): {
      reducer<F extends (frame: OverrideReducerFrame<J, ReducerOfReducerDef<D>>)
      => (...args: any) => ValueOf<J>>(
        reducerFn: F): D extends Def<any, any, DefAccess.public> ? PubReducerDef<ReturnType<F>> :
        D extends Def<any, any, DefAccess.protected> ? PrtReducerDef<ReturnType<F>> :
          PrvReducerDef<ReturnType<F>>
    };

    <D extends TriggerDef<any, any>>(parent: D): {
      trigger<F extends (frame: OverrideTriggerFrame<J, TriggerOfTriggerDef<D>>)
      => (...args: any) => ReadonlyArray<Action>>(
        reducerFn: F): D extends Def<any, any, DefAccess.public> ? PubTriggerDef<(...args : OverloadParameters<ReturnType<F>>) => Action[]> :
        D extends Def<any, any, DefAccess.protected> ? PrtTriggerDef<(...args : OverloadParameters<ReturnType<F>>) => Action[]> :
          PrvTriggerDef<(...args : OverloadParameters<ReturnType<F>>) => Action[]>
    };

    <D extends ReactorDef<any>>(parent : D): {
      reactor<F extends (frame: OverrideReactorFrame<J, (frame: ReactorFrame<J>) => ReactorOfReactorDef<D>>) => any>
      (reactorFn: F): ReturnType<F> extends void ? SafeReactorDef : DisposableReactorDef;
    };
  } = this.createOverrideProxy;

  readonly protected = new ProtectedForger<J>(this.assembler);

  readonly private = new PrivateForger<J>(this.assembler);

  selector<F extends (frame: SelectorFrame<J>) => any>(selectorFn: F): PubSelectorDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createSelectorDef(selectorFn as any));
  }

  paramSelector<F extends (frame: SelectorFrame<J>) => (...args: any) => any>(
    selectorFn: F): PubParamSelectorDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createParamSelectorDef(selectorFn as any));
  }

  reducer<F extends (frame: ReducerFrame<J>) => (...args: any) => ValueOf<J>>(
    reducerFn: F): PubReducerDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createReducerDef(reducerFn as any));
  }

  trigger<F extends (frame: TriggerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): PubTriggerDef<(...args : OverloadParameters<ReturnType<F>>) => Action[]> {
    const fn: any = reducerFn || (() => () => []);
    return this.assembler.registerStaticProperty(createTriggerDef(fn));
  }

  reactor<F extends (frame: ReactorFrame<J>) => (() => void) | void>(reactorFn: F):
  ReturnType<F> extends void ? SafeReactorDef : DisposableReactorDef {
    return this.assembler.registerStaticProperty(createReactorDef(reactorFn as any)) as any;
  }
}
// #endregion
