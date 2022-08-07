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
  ActivatorDef, ActivatorDefVariety, ActivatorOfActivatorDef, createReducerDef, createTriggerDef, isReducerDef, isTriggerDef, PrivateReducerDef, PrivateTriggerDef, ProtectedReducerDef, ProtectedTriggerDef, ReducerDef, TriggerDef
} from './definition/activator';
import { Def, DefAccess, isDef } from './definition/def';
import {
  createReactorDef, DisposableReactorDef, ReactorDef, ReactorOfReactorDef, SafeReactorDef
} from './definition/reactor';
import {
  createParamSelectorDef, createSelectorDef, isParamSelectorDef,
  isSelectorDef, ParamSelectorDef, PrivateParamSelectorDef, PrivateSelectorDef, SelectorDef, SelectorOfUniSelectorDef, UniSelectorDef, UniSelectorDefVariety
} from './definition/selector';
import { PropertyAssembler } from './fabric/property-assembler';
import { Juncture, ValueOf } from './juncture';
import { jSymbols } from './symbols';

export interface CreateDefForOverrideArgs {
  readonly key: string;
  readonly parentDef: Def<any, any, any>;
  readonly fnName: string;
  readonly fnArgs: any[]
}

// #region ProtectedComposer
export class ProtectedComposer<J extends Juncture> {
  constructor(protected readonly assembler: PropertyAssembler) { }

  reducer<F extends (frame: ReducerFrame<J>) => (...args: any) => ValueOf<J>>(
    reducerFn: F): ProtectedReducerDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createReducerDef(DefAccess.protected, reducerFn as any));
  }

  trigger(): ProtectedTriggerDef<() => []>;
  trigger<F extends (frame: TriggerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): ProtectedTriggerDef<ReturnType<F>>;
  trigger<F extends (frame: TriggerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn?: F) {
    const fn: any = reducerFn || (() => () => []);
    return this.assembler.registerStaticProperty(createTriggerDef(DefAccess.protected, fn));
  }
}
// #endregion

// #region PrivateComposer
export class PrivateComposer<J extends Juncture> {
  constructor(protected readonly assembler: PropertyAssembler) { }

  selector<F extends (frame: SelectorFrame<J>) => any>(selectorFn: F): PrivateSelectorDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createSelectorDef(DefAccess.private, selectorFn as any));
  }

  paramSelector<F extends (frame: SelectorFrame<J>) => (...args: any) => any>(
    selectorFn: F): PrivateParamSelectorDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createParamSelectorDef(DefAccess.private, selectorFn as any));
  }

  reducer<F extends (frame: ReducerFrame<J>) => (...args: any) => ValueOf<J>>(
    reducerFn: F): PrivateReducerDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createReducerDef(DefAccess.private, reducerFn as any));
  }

  trigger(): PrivateTriggerDef<() => []>;
  trigger<F extends (frame: TriggerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): PrivateTriggerDef<ReturnType<F>>;
  trigger<F extends (frame: TriggerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn?: F) {
    const fn: any = reducerFn || (() => () => []);
    return this.assembler.registerStaticProperty(createTriggerDef(DefAccess.private, fn));
  }
}
// #endregion

// #region Composer
export class Composer<J extends Juncture> {
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
    if (isSelectorDef(args.parentDef)) {
      if (args.fnName === 'selector') {
        return createSelectorDef(args.parentDef.access as any, frame => {
          const parent = args.parentDef[jSymbols.defPayload](frame);
          const frame2 = { ...frame, parent };
          return args.fnArgs[0](frame2);
        });
      }
    }

    if (isParamSelectorDef(args.parentDef)) {
      if (args.fnName === 'paramSelector') {
        return createParamSelectorDef(args.parentDef.access as any, frame => {
          const parent = args.parentDef[jSymbols.defPayload](frame);
          const frame2 = { ...frame, parent };
          return args.fnArgs[0](frame2);
        });
      }
    }

    if (isReducerDef(args.parentDef)) {
      if (args.fnName === 'reducer') {
        return createReducerDef(args.parentDef.access as any, frame => {
          const parent = args.parentDef[jSymbols.defPayload](frame);
          const frame2 = { ...frame, parent };
          return args.fnArgs[0](frame2);
        });
      }
    }

    if (isTriggerDef(args.parentDef)) {
      if (args.fnName === 'trigger') {
        return createTriggerDef(args.parentDef.access as any, frame => {
          const parent = args.parentDef[jSymbols.defPayload](frame);
          const frame2 = { ...frame, parent };
          return args.fnArgs[0](frame2);
        });
      }
    }

    // eslint-disable-next-line max-len
    throw Error(`Unable to override DefType "${args.parentDef.type}" for property "${args.key}" with ${args.fnName}(...)`);
  }

  // eslint-disable-next-line class-methods-use-this
  readonly override: {
    <D extends UniSelectorDef<UniSelectorDefVariety.standard, any, any>>(parent : D): {
      selector<F extends (frame: OverrideSelectorFrame<J, SelectorOfUniSelectorDef<D>>) => any>
      (selectorFn: F): D extends UniSelectorDef<any, DefAccess.public, any> ? SelectorDef<ReturnType<F>> : PrivateSelectorDef<ReturnType<F>>;
    };

    <D extends UniSelectorDef<UniSelectorDefVariety.param, any, any>>(parent: D): {
      paramSelector<F extends (frame: OverrideSelectorFrame<J, SelectorOfUniSelectorDef<D>>)
      => (...args: any) => any>(
        selectorFn: F): D extends UniSelectorDef<any, DefAccess.public, any> ? ParamSelectorDef<ReturnType<F>> : PrivateParamSelectorDef<ReturnType<F>>;
    };

    <D extends ActivatorDef<ActivatorDefVariety.reducer, any, any>>(parent: D): {
      reducer<F extends (frame: OverrideReducerFrame<J, ActivatorOfActivatorDef<D>>)
      => (...args: any) => ValueOf<J>>(
        reducerFn: F): D extends ActivatorDef<any, DefAccess.public, any> ? ReducerDef<ReturnType<F>> :
        D extends ActivatorDef<any, DefAccess.protected, any> ? ProtectedReducerDef<ReturnType<F>> :
          PrivateReducerDef<ReturnType<F>>
    };

    <D extends ActivatorDef<ActivatorDefVariety.trigger, any, any>>(parent: D): {
      trigger<F extends (frame: OverrideTriggerFrame<J, ActivatorOfActivatorDef<D>>)
      => (...args: any) => ReadonlyArray<Action>>(
        reducerFn: F): D extends ActivatorDef<any, DefAccess.public, any> ? TriggerDef<ReturnType<F>> :
        D extends ActivatorDef<any, DefAccess.protected, any> ? ProtectedTriggerDef<ReturnType<F>> :
          PrivateTriggerDef<ReturnType<F>>
    };

    <D extends ReactorDef<any>>(parent : D): {
      reactor<F extends (frame: OverrideReactorFrame<J, (frame: ReactorFrame<J>) => ReactorOfReactorDef<D>>) => any>
      (reactorFn: F): ReturnType<F> extends void ? SafeReactorDef : DisposableReactorDef;
    };
  } = this.createOverrideProxy;

  readonly protected = new ProtectedComposer<J>(this.assembler);

  readonly private = new PrivateComposer<J>(this.assembler);

  selector<F extends (frame: SelectorFrame<J>) => any>(selectorFn: F): SelectorDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createSelectorDef(DefAccess.public, selectorFn as any));
  }

  paramSelector<F extends (frame: SelectorFrame<J>) => (...args: any) => any>(
    selectorFn: F): ParamSelectorDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createParamSelectorDef(DefAccess.public, selectorFn as any));
  }

  reducer<F extends (frame: ReducerFrame<J>) => (...args: any) => ValueOf<J>>(
    reducerFn: F): ReducerDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createReducerDef(DefAccess.public, reducerFn as any));
  }

  trigger(): TriggerDef<() => []>;
  trigger<F extends (frame: TriggerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): TriggerDef<ReturnType<F>>;
  trigger<F extends (frame: TriggerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn?: F) {
    const fn: any = reducerFn || (() => () => []);
    return this.assembler.registerStaticProperty(createTriggerDef(DefAccess.public, fn));
  }

  reactor<F extends (frame: ReactorFrame<J>) => (() => void) | void>(reactorFn: F):
  ReturnType<F> extends void ? SafeReactorDef : DisposableReactorDef {
    return this.assembler.registerStaticProperty(createReactorDef(reactorFn as any)) as any;
  }
}
// #endregion
