/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { AccessModifier } from './access';
import {
  Descriptor, isDescriptor
} from './design/descriptor';
import { DescriptorType } from './design/descriptor-type';
import {
  Behavior, BodyOfBehavior, createBehavior, DisposableBehavior, SafeBehavior
} from './design/descriptors/behavior';
import { Channel, createChannel, PrivateChannel } from './design/descriptors/channel';
import { createOpenChannel, OpenChannel } from './design/descriptors/open-channel';
import {
  BodyOfParamSelector, createParamSelector, GenericParamSelector, ParamSelector, PrivateParamSelector
} from './design/descriptors/param-selector';
import {
  BodyOfReactor, createReactor, GenericReactor, PrivateReactor, Reactor
} from './design/descriptors/reactor';
import {
  BodyOfSelector, createSelector, GenericSelector, PrivateSelector, Selector
} from './design/descriptors/selector';
import {
  BodyOfSynthReactor, createSynthReactor, GenericSynthReactor, PrivateSynthReactor, SynthReactor
} from './design/descriptors/synth-reactor';
import { Driver, ValueOf } from './driver';
import { BehaviorFrame, OverrideBehaviorFrame } from './operation/frames/behavior-frame';
import { Frame, OverrideFrame } from './operation/frames/frame';
import { OverrideSynthReactorFrame, SynthReactorFrame } from './operation/frames/synth-reactor-frame';
import { Instruction } from './operation/instruction';
import { jSymbols } from './symbols';
import { OverloadParameters } from './tool/overload-types';
import { PropertyAssembler } from './tool/property-assembler';

export interface CreateDescriptorForOverrideArgs {
  readonly key: string;
  readonly parent: Descriptor<any, any, any>;
  readonly fnName: string;
  readonly fnArgs: any[]
}

// #region PrivateForger
export class PrivateForger<D extends Driver> {
  constructor(protected readonly assembler: PropertyAssembler) { }

  selector<F extends (frame: Frame<D>) => any>(selectorFn: F): PrivateSelector<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createSelector(selectorFn as any, AccessModifier.private));
  }

  paramSelector<F extends (frame: Frame<D>) => (...args: any) => any>(
    selectorFn: F): PrivateParamSelector<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createParamSelector(selectorFn as any, AccessModifier.private));
  }

  reactor<F extends (frame: Frame<D>) => (...args: any) => ValueOf<D>>(
    reactorFn: F): PrivateReactor<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createReactor(reactorFn as any, AccessModifier.private));
  }

  synthReactor<F extends (frame: SynthReactorFrame<D>) => (...args: any) => Instruction | Instruction[]>(
    reactorFn: F): PrivateSynthReactor<(...args : OverloadParameters<ReturnType<F>>) => Instruction[]> {
    return this.assembler.registerStaticProperty(createSynthReactor(reactorFn as any, AccessModifier.private));
  }

  channel(): PrivateChannel<void>;
  channel<V>(): PrivateChannel<V>;
  channel() {
    return this.assembler.registerStaticProperty(createChannel(AccessModifier.private));
  }
}
// #endregion

// #region Forger
export class Forger<D extends Driver> {
  protected readonly assembler: PropertyAssembler;

  readonly private: PrivateForger<D>;

  constructor(assembler: PropertyAssembler);
  constructor(driver: D);
  constructor(assembler_or_driver: PropertyAssembler | D) {
    if (assembler_or_driver instanceof Driver) {
      this.assembler = PropertyAssembler.get(assembler_or_driver);
    } else {
      this.assembler = assembler_or_driver;
    }

    this.private = this.createPrivateForger();
  }

  selector<F extends (frame: Frame<D>) => any>(selectorFn: F): Selector<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createSelector(selectorFn as any));
  }

  paramSelector<F extends (frame: Frame<D>) => (...args: any) => any>(
    selectorFn: F): ParamSelector<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createParamSelector(selectorFn as any));
  }

  reactor<F extends (frame: Frame<D>) => (...args: any) => ValueOf<D>>(
    reactorFn: F): Reactor<ReturnType<F>> {
    return this.assembler.registerStaticProperty(createReactor(reactorFn as any));
  }

  synthReactor<F extends (frame: SynthReactorFrame<D>) => (...args: any) => Instruction | Instruction[]>(
    reactorFn: F): SynthReactor<(...args : OverloadParameters<ReturnType<F>>) => Instruction[]> {
    return this.assembler.registerStaticProperty(createSynthReactor(reactorFn as any));
  }

  behavior<F extends (frame: BehaviorFrame<D>) => (() => void) | void>(behaviorFn: F):
  ReturnType<F> extends void ? SafeBehavior : DisposableBehavior {
    return this.assembler.registerStaticProperty(createBehavior(behaviorFn as any)) as any;
  }

  channel(): Channel<void>;
  channel<V>(): Channel<V>;
  channel() {
    return this.assembler.registerStaticProperty(createChannel());
  }

  openChannel(): OpenChannel<void>;
  openChannel<V>(): OpenChannel<V>;
  openChannel() {
    return this.assembler.registerStaticProperty(createOpenChannel());
  }

  // #region Override
  protected createPrivateForger() {
    return new PrivateForger(this.assembler);
  }

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
      case DescriptorType.reactor:
        if (args.fnName === 'reactor') {
          return createReactor(frame => {
            const parent = args.parent[jSymbols.payload](frame);
            const frame2 = { ...frame, parent };
            return args.fnArgs[0](frame2);
          }, args.parent.access);
        }
        break;
      case DescriptorType.synthReactor:
        if (args.fnName === 'synthReactor') {
          return createSynthReactor(frame => {
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
    <L extends GenericSelector<any, any>>(parent : L): {
      selector<F extends (frame: OverrideFrame<D, BodyOfSelector<L>>) => any>
      (selectorFn: F): L extends Descriptor<any, any, AccessModifier.public> ? Selector<ReturnType<F>> : PrivateSelector<ReturnType<F>>;
    };

    <L extends GenericParamSelector<any, any>>(parent: L): {
      paramSelector<F extends (frame: OverrideFrame<D, BodyOfParamSelector<L>>)
      => (...args: any) => any>(
        selectorFn: F): L extends Descriptor<any, any, AccessModifier.public> ? ParamSelector<ReturnType<F>> : PrivateParamSelector<ReturnType<F>>;
    };

    <L extends GenericReactor<any, any>>(parent: L): {
      reactor<F extends (frame: OverrideFrame<D, BodyOfReactor<L>>)
      => (...args: any) => ValueOf<D>>(
        reactorFn: F): L extends Descriptor<any, any, AccessModifier.public> ? Reactor<ReturnType<F>> :
        PrivateReactor<ReturnType<F>>
    };

    <L extends GenericSynthReactor<any, any>>(parent: L): {
      synthReactor<F extends (frame: OverrideSynthReactorFrame<D, BodyOfSynthReactor<L>>)
      => (...args: any) => Instruction | Instruction[]>(
        reactorFn: F): L extends Descriptor<any, any, AccessModifier.public> ? SynthReactor<(...args : OverloadParameters<ReturnType<F>>) => Instruction[]> :
        PrivateSynthReactor<(...args : OverloadParameters<ReturnType<F>>) => Instruction[]>
    };

    <L extends Behavior<any>>(parent : L): {
      behavior<F extends (frame: OverrideBehaviorFrame<D, (frame: BehaviorFrame<D>) => BodyOfBehavior<L>>) => any>
      (behaviorFn: F): ReturnType<F> extends void ? SafeBehavior : DisposableBehavior;
    };
  } = this.createOverrideProxy;
  // #endregion
}
// #endregion
