/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Action } from './context/action';
import { MixReducerFrame, OverrideMixReducerFrame } from './context/frames/mix-reducer-frame';
import { OverrideReducerFrame, ReducerFrame } from './context/frames/reducer-frame';
import { OverrideSelectorFrame, SelectorFrame } from './context/frames/selector-frame';
import { Def, isDef } from './definition/def';
import {
  asPrivate, isPrivate, Private, SameAccess
} from './definition/private';
import {
  createMixReducerDef, createReducerDef, isMixReducerDef,
  isReducerDef, MixReducerDef, ReducerDef, ReducerOfUniReducerDef
} from './definition/reducer';
import {
  createParamSelectorDef, createSelectorDef, isParamSelectorDef,
  isSelectorDef, ParamSelectorDef, SelectorDef, SelectorOfUniSelectorDef
} from './definition/selector';
import { PropertyAssembler } from './fabric/property-assembler';
import { HandledValueOf, Juncture } from './juncture';
import { jSymbols } from './symbols';

export interface CreateDefForOverrideArgs {
  readonly key: string;
  readonly parentDef: Def<any, any, any>;
  readonly fnName: string;
  readonly fnArgs: any[]
}

export class PrivateComposer<J extends Juncture> {
  constructor(protected readonly assembler: PropertyAssembler) { }

  selector<F extends (frame: SelectorFrame<J>) => any>(selectorFn: F): Private<SelectorDef<ReturnType<F>>> {
    return this.assembler.registerStaticProperty(asPrivate(createSelectorDef(selectorFn as any)));
  }

  paramSelector<F extends (frame: SelectorFrame<J>) => (...args: any) => any>(
    selectorFn: F): Private<ParamSelectorDef<ReturnType<F>>> {
    return this.assembler.registerStaticProperty(asPrivate(createParamSelectorDef(selectorFn as any)));
  }

  reducer<F extends (frame: ReducerFrame<J>) => (...args: any) => HandledValueOf<J>>(
    reducerFn: F): Private<ReducerDef<ReturnType<F>>> {
    return this.assembler.registerStaticProperty(asPrivate(createReducerDef(reducerFn as any)));
  }

  mixReducer<F extends (frame: MixReducerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): Private<MixReducerDef<ReturnType<F>>> {
    return this.assembler.registerStaticProperty(asPrivate(createMixReducerDef(reducerFn as any)));
  }
}

export class Composer<J extends Juncture> {
  constructor(protected readonly assembler: PropertyAssembler) { }

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
    if (isSelectorDef(args.parentDef)) {
      if (args.fnName === 'selector') {
        return createSelectorDef(frame => {
          const parent = args.parentDef[jSymbols.defPayload](frame);
          const frame2 = { ...frame, parent };
          return args.fnArgs[0](frame2);
        });
      }
    }

    if (isParamSelectorDef(args.parentDef)) {
      if (args.fnName === 'paramSelector') {
        return createParamSelectorDef(frame => {
          const parent = args.parentDef[jSymbols.defPayload](frame);
          const frame2 = { ...frame, parent };
          return args.fnArgs[0](frame2);
        });
      }
    }

    if (isReducerDef(args.parentDef)) {
      if (args.fnName === 'reducer') {
        return createReducerDef(frame => {
          const parent = args.parentDef[jSymbols.defPayload](frame);
          const frame2 = { ...frame, parent };
          return args.fnArgs[0](frame2);
        });
      }
    }

    if (isMixReducerDef(args.parentDef)) {
      if (args.fnName === 'mixReducer') {
        return createMixReducerDef(frame => {
          const parent = args.parentDef[jSymbols.defPayload](frame);
          const frame2 = { ...frame, parent };
          return args.fnArgs[0](frame2);
        });
      }
    }

    // eslint-disable-next-line max-len
    throw Error(`Unable to override defKind "${args.parentDef.defKind}" for property "${args.key}" with ${args.fnName}(...)`);
  }

  // eslint-disable-next-line class-methods-use-this
  readonly override: {
    <D extends SelectorDef<any>>(parent : D): {
      selector<F extends (frame: OverrideSelectorFrame<J, SelectorOfUniSelectorDef<D>>) => any>
      (selectorFn: F): SameAccess<D, SelectorDef<ReturnType<F>>>;
    };

    <D extends ParamSelectorDef<any>>(parent: D): {
      paramSelector<F extends (frame: OverrideSelectorFrame<J, SelectorOfUniSelectorDef<D>>)
      => (...args: any) => any>(
        selectorFn: F): SameAccess<D, ParamSelectorDef<ReturnType<F>>>;
    };

    <D extends ReducerDef<any>>(parent: D): {
      reducer<F extends (frame: OverrideReducerFrame<J, ReducerOfUniReducerDef<D>>)
      => (...args: any) => HandledValueOf<J>>(
        reducerFn: F): SameAccess<D, ReducerDef<ReturnType<F>>>
    };

    <D extends MixReducerDef<any>>(parent: D): {
      mixReducer<F extends (frame: OverrideMixReducerFrame<J, ReducerOfUniReducerDef<D>>)
      => (...args: any) => ReadonlyArray<Action>>(
        reducerFn: F): SameAccess<D, MixReducerDef<ReturnType<F>>>
    };
  } = this.createOverrideProxy;

  readonly private = new PrivateComposer<J>(this.assembler);

  selector<F extends (frame: SelectorFrame<J>) => any>(selectorFn: F): SelectorDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createSelectorDef(selectorFn as any));
  }

  paramSelector<F extends (frame: SelectorFrame<J>) => (...args: any) => any>(
    selectorFn: F): ParamSelectorDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createParamSelectorDef(selectorFn as any));
  }

  reducer<F extends (frame: ReducerFrame<J>) => (...args: any) => HandledValueOf<J>>(
    reducerFn: F): ReducerDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createReducerDef(reducerFn as any));
  }

  mixReducer<F extends (frame: MixReducerFrame<J>) => (...args: any) => ReadonlyArray<Action>>(
    reducerFn: F): MixReducerDef<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createMixReducerDef(reducerFn as any));
  }
}
