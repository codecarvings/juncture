/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { Action } from '../engine/action';
import { OverrideReactorFrame, ReactorFrame } from '../engine/frames/reactor-frame';
import { OverrideReducerFrame, ReducerFrame } from '../engine/frames/reducer-frame';
import { OverrideSelectorFrame, SelectorFrame } from '../engine/frames/selector-frame';
import { OverrideTriggerFrame, TriggerFrame } from '../engine/frames/trigger-frame';
import { Juncture, ValueOf } from '../juncture';
import { OverloadParameters } from '../misc/overloaed-function-types';
import { jSymbols } from '../symbols';
import { AccessModifier } from './access-modifier';
import {
  Descriptor, DescriptorType, isDescriptor
} from './descriptor';
import {
  BodyOfParamSelector, createParamSelector, GenericParamSelector, ParamSelector, PrivateParamSelector
} from './descriptors/param-selector';
import {
  BodyOfReactor, createReactor, DisposableReactor, Reactor, SafeReactor
} from './descriptors/reactor';
import {
  BodyOfReducer, createReducer, GenericReducer, PrivateReducer, ProtectedReducer, Reducer
} from './descriptors/reducer';
import {
  BodyOfSelector, createSelector, GenericSelector, PrivateSelector, Selector
} from './descriptors/selector';
import {
  BodyOfTrigger, createTrigger, GenericTrigger, PrivateTrigger, ProtectedTrigger, Trigger
} from './descriptors/trigger';
import { PropertyAssembler } from './property-assembler';

export interface CreateDescriptorForOverrideArgs {
  readonly key: string;
  readonly parent: Descriptor<any, any, any>;
  readonly fnName: string;
  readonly fnArgs: any[]
}

// #region ProtectedForger
export class ProtectedForger<J extends Juncture> {
  constructor(protected readonly assembler: PropertyAssembler) { }

  reducer<F extends (frame: ReducerFrame<J>) => (...args: any) => ValueOf<J>>(
    reducerFn: F): ProtectedReducer<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createReducer(reducerFn as any, AccessModifier.protected));
  }

  trigger<F extends (frame: TriggerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): ProtectedTrigger<(...args : OverloadParameters<ReturnType<F>>) => Action[]> {
    const fn: any = reducerFn || (() => () => []);
    return this.assembler.registerStaticProperty(createTrigger(fn, AccessModifier.protected));
  }
}
// #endregion

// #region PrivateForger
export class PrivateForger<J extends Juncture> {
  constructor(protected readonly assembler: PropertyAssembler) { }

  selector<F extends (frame: SelectorFrame<J>) => any>(selectorFn: F): PrivateSelector<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createSelector(selectorFn as any, AccessModifier.private));
  }

  paramSelector<F extends (frame: SelectorFrame<J>) => (...args: any) => any>(
    selectorFn: F): PrivateParamSelector<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createParamSelector(selectorFn as any, AccessModifier.private));
  }

  reducer<F extends (frame: ReducerFrame<J>) => (...args: any) => ValueOf<J>>(
    reducerFn: F): PrivateReducer<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createReducer(reducerFn as any, AccessModifier.private));
  }

  trigger<F extends (frame: TriggerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): PrivateTrigger<(...args : OverloadParameters<ReturnType<F>>) => Action[]> {
    const fn: any = reducerFn || (() => () => []);
    return this.assembler.registerStaticProperty(createTrigger(fn, AccessModifier.private));
  }
}
// #endregion

// #region Forger
export class Forger<J extends Juncture> {
  constructor(protected readonly assembler: PropertyAssembler) { }

  // eslint-disable-next-line class-methods-use-this
  protected createOverrideProxy(): any {
    const { assembler } = this;
    const createDescriptorForOverride = this.createDescriptorForOverride.bind(this);
    let revoke: () => void;
    const target = {};
    const handler: ProxyHandler<typeof target> = {
      get(_target, fnName) {
        return (...fnArgs: any) => assembler.registerDynamicProperty((key, parent) => {
          if (revoke) {
            revoke();
          }
          if (parent === undefined) {
            throw Error(`Unable to override property "${key}" (no parent found)`);
          }
          if (!isDescriptor(parent)) {
            throw Error(`Unable to override property "${key}" (parent is not a Descriptor)`);
          }
          return createDescriptorForOverride({
            key, parent, fnName, fnArgs
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
  protected createDescriptorForOverride(args: CreateDescriptorForOverrideArgs): Descriptor<any, any, any> {
    switch (args.parent.type) {
      case DescriptorType.selector:
        if (args.fnName === 'selector') {
          return createSelector(frame => {
            const parent = args.parent[jSymbols.payload](frame);
            const frame2 = { ...frame, parent };
            return args.fnArgs[0](frame2);
          }, args.parent.access);
        }
        break;
      case DescriptorType.paramSelector:
        if (args.fnName === 'paramSelector') {
          return createParamSelector(frame => {
            const parent = args.parent[jSymbols.payload](frame);
            const frame2 = { ...frame, parent };
            return args.fnArgs[0](frame2);
          }, args.parent.access);
        }
        break;
      case DescriptorType.reducer:
        if (args.fnName === 'reducer') {
          return createReducer(frame => {
            const parent = args.parent[jSymbols.payload](frame);
            const frame2 = { ...frame, parent };
            return args.fnArgs[0](frame2);
          }, args.parent.access);
        }
        break;
      case DescriptorType.trigger:
        if (args.fnName === 'trigger') {
          return createTrigger(frame => {
            const parent = args.parent[jSymbols.payload](frame);
            const frame2 = { ...frame, parent };
            return args.fnArgs[0](frame2);
          }, args.parent.access);
        }
        break;
      default:
        break;
    }

    throw Error(`Unable to override Descriptor type "${args.parent.type}" for property "${args.key}" with ${args.fnName}(...)`);
  }

  // eslint-disable-next-line class-methods-use-this
  readonly override: {
    <D extends GenericSelector<any, any>>(parent : D): {
      selector<F extends (frame: OverrideSelectorFrame<J, BodyOfSelector<D>>) => any>
      (selectorFn: F): D extends Descriptor<any, any, AccessModifier.public> ? Selector<ReturnType<F>> : PrivateSelector<ReturnType<F>>;
    };

    <D extends GenericParamSelector<any, any>>(parent: D): {
      paramSelector<F extends (frame: OverrideSelectorFrame<J, BodyOfParamSelector<D>>)
      => (...args: any) => any>(
        selectorFn: F): D extends Descriptor<any, any, AccessModifier.public> ? ParamSelector<ReturnType<F>> : PrivateParamSelector<ReturnType<F>>;
    };

    <D extends GenericReducer<any, any>>(parent: D): {
      reducer<F extends (frame: OverrideReducerFrame<J, BodyOfReducer<D>>)
      => (...args: any) => ValueOf<J>>(
        reducerFn: F): D extends Descriptor<any, any, AccessModifier.public> ? Reducer<ReturnType<F>> :
        D extends Descriptor<any, any, AccessModifier.protected> ? ProtectedReducer<ReturnType<F>> :
          PrivateReducer<ReturnType<F>>
    };

    <D extends GenericTrigger<any, any>>(parent: D): {
      trigger<F extends (frame: OverrideTriggerFrame<J, BodyOfTrigger<D>>)
      => (...args: any) => ReadonlyArray<Action>>(
        reducerFn: F): D extends Descriptor<any, any, AccessModifier.public> ? Trigger<(...args : OverloadParameters<ReturnType<F>>) => Action[]> :
        D extends Descriptor<any, any, AccessModifier.protected> ? ProtectedTrigger<(...args : OverloadParameters<ReturnType<F>>) => Action[]> :
          PrivateTrigger<(...args : OverloadParameters<ReturnType<F>>) => Action[]>
    };

    <D extends Reactor<any>>(parent : D): {
      reactor<F extends (frame: OverrideReactorFrame<J, (frame: ReactorFrame<J>) => BodyOfReactor<D>>) => any>
      (reactorFn: F): ReturnType<F> extends void ? SafeReactor : DisposableReactor;
    };
  } = this.createOverrideProxy;

  readonly protected = new ProtectedForger<J>(this.assembler);

  readonly private = new PrivateForger<J>(this.assembler);

  selector<F extends (frame: SelectorFrame<J>) => any>(selectorFn: F): Selector<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createSelector(selectorFn as any));
  }

  paramSelector<F extends (frame: SelectorFrame<J>) => (...args: any) => any>(
    selectorFn: F): ParamSelector<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createParamSelector(selectorFn as any));
  }

  reducer<F extends (frame: ReducerFrame<J>) => (...args: any) => ValueOf<J>>(
    reducerFn: F): Reducer<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createReducer(reducerFn as any));
  }

  trigger<F extends (frame: TriggerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): Trigger<(...args : OverloadParameters<ReturnType<F>>) => Action[]> {
    const fn: any = reducerFn || (() => () => []);
    return this.assembler.registerStaticProperty(createTrigger(fn));
  }

  reactor<F extends (frame: ReactorFrame<J>) => (() => void) | void>(reactorFn: F):
  ReturnType<F> extends void ? SafeReactor : DisposableReactor {
    return this.assembler.registerStaticProperty(createReactor(reactorFn as any)) as any;
  }
}
// #endregion
