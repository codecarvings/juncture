/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BodyOfSchema, Schema } from './design/descriptors/schema';
import { createSelector, Selector } from './design/descriptors/selector';
import { JunctureSchema } from './design/schema';
import { createCursor, Cursor } from './engine/equipment/cursor';
import {
  Gear, GearLayout, GearMediator, GearMountStatus
} from './engine/gear';
import { getGear } from './engine/gear-host';
import { Path } from './engine/path';
import { JMachineGearMediator } from './j-machine';
import { jSymbols } from './symbols';
import { Initializable } from './tool/initializable';
import { getObjectAttachment } from './tool/object';
import { PropertyAssembler, PropertyAssemblerHost } from './tool/property-assembler';
import { Singleton } from './tool/singleton';

// #region Symbols
const schemaCacheSymbol = Symbol('schemaCache');
interface JunctureSymbols {
  readonly schemaCache: typeof schemaCacheSymbol;
}
const junctureSymbols: JunctureSymbols = {
  schemaCache: schemaCacheSymbol
};
// #endregion

export abstract class Juncture implements PropertyAssemblerHost, Initializable {
  // #region Engine methods
  [jSymbols.createPropertyAssembler](): PropertyAssembler {
    return new PropertyAssembler(this);
  }

  [jSymbols.init]() {
    PropertyAssembler.get(this).wire();
  }

  [jSymbols.createGear](layout: GearLayout, gearMediator: GearMediator, machineMediator: JMachineGearMediator): Gear {
    return new Gear(this, layout, gearMediator, machineMediator);
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createCursor](gear: Gear): Cursor<this> {
    return createCursor(gear) as Cursor<this>;
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createInternalCursor](gear: Gear): Cursor<this> {
    return gear.cursor as Cursor<this>;
  }
  // #endregion

  constructor() {
    const assembler = Juncture.getPropertyAssembler(this);

    this.defaultValue = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getGear(frame._).schema.defaultValue));

    this.path = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getGear(frame._).layout.path));

    this.isMounted = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getGear(frame._).mountStatus === GearMountStatus.mounted));

    this.value = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getGear(frame._).value));
  }

  // #region Descriptors
  abstract readonly schema: Schema<JunctureSchema>;

  readonly defaultValue: Selector<ValueOf<this>>;

  readonly path: Selector<Path>;

  readonly isMounted: Selector<boolean>;

  readonly value: Selector<ValueOf<this>>;
  // #endregion

  // #region Static
  static getInstance<JT extends JunctureCtor>(Ctor: JT): InstanceType<JT> {
    return Singleton.get(Ctor).instance;
  }

  static getPropertyAssembler(juncture: Juncture): PropertyAssembler {
    return PropertyAssembler.get(juncture);
  }

  static getSchema<JT extends JunctureCtor>(Ctor: JT): SchemaOfCtor<JT>;
  static getSchema<J extends Juncture>(juncture: J): SchemaOf<J>;
  static getSchema(juncture_or_Ctor: Juncture | JunctureCtor) {
    const juncture = Singleton.getInstance(juncture_or_Ctor) as Juncture;
    return getObjectAttachment(juncture, junctureSymbols.schemaCache, () => juncture.schema[jSymbols.payload]());
  }

  static createGear(
    Ctor: JunctureCtor,
    layoyt: GearLayout,
    gearMediator: GearMediator,
    machineMediator: JMachineGearMediator
  ): Gear {
    const juncture = Juncture.getInstance(Ctor);
    return juncture[jSymbols.createGear](layoyt, gearMediator, machineMediator);
  }
  // #endregion
}

// ---  Derivations
export type SchemaOf<J extends Juncture> = BodyOfSchema<J['schema']>;
export type ValueOf<J extends Juncture> = BodyOfSchema<J['schema']>['defaultValue'];

// Use inference to keep type name
export type CursorOf<J extends Juncture> = J extends {
  [jSymbols.createCursor](...args : any) : infer C
} ? C : never;
export type InternalCursorOf<J extends Juncture> = J extends {
  [jSymbols.createInternalCursor](...args : any) : infer C
} ? C : never;
// #endregion

// #region JunctureCtor
export interface JunctureCtor<J extends Juncture = Juncture> {
  new(): J;
}

// ---  Derivations
export type SchemaOfCtor<JT extends JunctureCtor> = SchemaOf<InstanceType<JT>>;
export type ValueOfCtor<JT extends JunctureCtor> = ValueOf<InstanceType<JT>>;

export type InternalCursorOfCtor<JT extends JunctureCtor> = InternalCursorOf<InstanceType<JT>>;
export type CursorOfCtor<JT extends JunctureCtor> = CursorOf<InstanceType<JT>>;
// #endregion

// #region JunctureCtorMap
export interface JunctureCtorMap {
  readonly [key: string]: JunctureCtor;
}

// ---  Derivations
export type CursorMapOfCtorMap<JTM extends JunctureCtorMap> = {
  readonly [K in keyof JTM]: CursorOfCtor<JTM[K]>;
};
// #endregion
