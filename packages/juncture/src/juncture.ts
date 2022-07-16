/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefComposer } from './definition/composer';
import { StandardPropertyAssembler } from './definition/property-assembler';
import { SchemaDef } from './definition/schema';
import { Driver } from './driver';
import { getFrame } from './frame/cursor';
import { Frame, FrameConfig } from './frame/frame';
import { SchemaHost, ValueOf } from './schema-host';
import { jSymbols } from './symbols';

// --- Symbols
const instanceSymbol = Symbol('instance');
const driverSymbol = Symbol('driver');
interface JunctureSymbols {
  readonly instance: typeof instanceSymbol;
  readonly driver: typeof driverSymbol;
}
const junctureSymbols: JunctureSymbols = {
  instance: instanceSymbol,
  driver: driverSymbol
};

// #region Juncture
export abstract class Juncture implements SchemaHost {
  protected [jSymbols.createDefComposer]() {
    return new DefComposer(this);
  }

  protected [jSymbols.createDriver]() {
    return new Driver<this>(this);
  }

  [jSymbols.createFrame](config: FrameConfig) {
    return new Frame(this, config);
  }

  protected readonly [jSymbols.propertyAssembler] = new StandardPropertyAssembler(this);

  protected readonly DEF: DefComposer<this> = this[jSymbols.createDefComposer]();

  readonly abstract schema: SchemaDef<any>;

  readonly defaultValue = this.DEF.selector(() => Juncture.getDriver(this).schema.defaultValue as ValueOf<this>);

  readonly path = this.DEF.selector(({ _ }) => getFrame(_).layout.path);

  readonly isMounted = this.DEF.selector(() => true); // TODO: Impement this

  readonly value = this.DEF.selector(() => undefined as ValueOf<this>);// TODO: Impement this

  static getInstance<JT extends JunctureType>(Type: JT): InstanceType<JT> {
    if ((Type as any)[junctureSymbols.instance]) {
      const cache = (Type as any)[junctureSymbols.instance] as { Type: JunctureType, instance: Juncture };
      // When subclassng a Juncture that already has the instance cache
      if (cache.Type === Type) {
        return cache.instance as InstanceType<JT>;
      }
    }
    const instance: InstanceType<JT> = new Type() as InstanceType<JT>;
    instance[jSymbols.propertyAssembler].close();

    // eslint-disable-next-line no-param-reassign
    (Type as any)[junctureSymbols.instance] = { Type, instance };
    return instance;
  }

  static getDriver<J extends Juncture>(juncture: J): Driver<J> {
    if ((juncture as any)[junctureSymbols.driver]) {
      return (juncture as any)[junctureSymbols.driver];
    }
    const result = (juncture as any)[jSymbols.createDriver]();
    // eslint-disable-next-line no-param-reassign
    (juncture as any)[junctureSymbols.driver] = result;
    return result;
  }

  static createFrame<J extends Juncture>(juncture: J, config: FrameConfig) {
    return juncture[jSymbols.createFrame](config);
  }
}

// ---  Derivations
export type FrameOf<J extends Juncture> = ReturnType<J[typeof jSymbols.createFrame]>;
export type PrivateCursorOf<J extends Juncture> = ReturnType<J[typeof jSymbols.createFrame]>['privateCursor'];
export type CursorOf<J extends Juncture> = ReturnType<J[typeof jSymbols.createFrame]>['cursor'];

export type FrameOfType<JT extends JunctureType> = FrameOf<InstanceType<JT>>;
export type PrivateCursorOfType<JT extends JunctureType> = PrivateCursorOf<InstanceType<JT>>;
export type CursorOfType<JT extends JunctureType> = CursorOf<InstanceType<JT>>;
// #endregion

// #region JunctureType
export interface JunctureType<J extends Juncture = Juncture> {
  new(): J;
}
// #endregion
