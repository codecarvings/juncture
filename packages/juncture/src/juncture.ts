/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BareJuncture, ValueOf } from './bare-juncture';
import { DefComposer } from './definition/composer';
import { PropertyAssembler, StandardPropertyAssembler } from './definition/property-assembler';
import { Schema, SchemaDef } from './definition/schema';
import { Driver } from './driver';
import { getFrame } from './frame/cursor';
import { Frame, FrameConfig } from './frame/frame';
import { jSymbols } from './symbols';

// --- Symbols
const propertyAssemblerSymbol = Symbol('propertyAssembler');
const instanceSymbol = Symbol('instance');
const driverSymbol = Symbol('driver');
interface JunctureSymbols {
  readonly propertyAssembler: typeof propertyAssemblerSymbol;
  readonly instance: typeof instanceSymbol;
  readonly driver: typeof driverSymbol;
}
const junctureSymbols: JunctureSymbols = {
  propertyAssembler: propertyAssemblerSymbol,
  instance: instanceSymbol,
  driver: driverSymbol
};

// #region Juncture
export abstract class Juncture implements BareJuncture {
  protected [jSymbols.createPropertyAssembler](): PropertyAssembler {
    return new StandardPropertyAssembler(this);
  }

  protected [jSymbols.createDefComposer]() {
    return new DefComposer(this);
  }

  protected [jSymbols.createDriver]() {
    return new Driver<this>(this);
  }

  [jSymbols.createFrame](config: FrameConfig): Frame<this> {
    return new Frame(this, config);
  }

  protected readonly DEF: DefComposer<this> = this[jSymbols.createDefComposer]();

  readonly abstract schema: SchemaDef<Schema>;

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
    Juncture.getPropertyAssembler(instance).wire();

    // eslint-disable-next-line no-param-reassign
    (Type as any)[junctureSymbols.instance] = { Type, instance };
    return instance;
  }

  static getPropertyAssembler<J extends Juncture>(juncture: J): PropertyAssembler {
    if ((juncture as any)[junctureSymbols.propertyAssembler]) {
      return (juncture as any)[junctureSymbols.propertyAssembler];
    }
    const result = juncture[jSymbols.createPropertyAssembler]();
    // eslint-disable-next-line no-param-reassign
    (juncture as any)[junctureSymbols.propertyAssembler] = result;
    return result;
  }

  static getDriver<J extends Juncture>(juncture: J): Driver<J> {
    if ((juncture as any)[junctureSymbols.driver]) {
      return (juncture as any)[junctureSymbols.driver];
    }
    const result = juncture[jSymbols.createDriver]();
    // eslint-disable-next-line no-param-reassign
    (juncture as any)[junctureSymbols.driver] = result;
    return result;
  }

  static createFrame<J extends Juncture>(juncture: J, config: FrameConfig) {
    return juncture[jSymbols.createFrame](config);
  }
}
// #endregion

// #region JunctureType
export interface JunctureType<J extends Juncture = Juncture> {
  new(): J;
}
// #endregion
