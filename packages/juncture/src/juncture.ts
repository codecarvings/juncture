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
  static getInstance<JT extends JunctureType>(Type: JT): InstanceType<JT> {
    return Singleton.get(Type).instance;
  }

  static getPropertyAssembler(juncture: Juncture): PropertyAssembler {
    return PropertyAssembler.get(juncture);
  }

  static getSchema<JT extends JunctureType>(Type: JT): SchemaOfType<JT>;
  static getSchema<J extends Juncture>(juncture: J): SchemaOf<J>;
  static getSchema(juncture_or_Type: Juncture | JunctureType) {
    const juncture = Singleton.getInstance(juncture_or_Type) as Juncture;
    return getObjectAttachment(juncture, junctureSymbols.schemaCache, () => juncture.schema[jSymbols.payload]());
  }

  static createGear(
    Type: JunctureType,
    layoyt: GearLayout,
    gearMediator: GearMediator,
    machineMediator: JMachineGearMediator
  ): Gear {
    const juncture = Juncture.getInstance(Type);
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

// #region JunctureType
export interface JunctureType<J extends Juncture = Juncture> {
  new(): J;
}

// ---  Derivations
export type SchemaOfType<JT extends JunctureType> = SchemaOf<InstanceType<JT>>;
export type ValueOfType<JT extends JunctureType> = ValueOf<InstanceType<JT>>;

export type InternalCursorOfType<JT extends JunctureType> = InternalCursorOf<InstanceType<JT>>;
export type CursorOfType<JT extends JunctureType> = CursorOf<InstanceType<JT>>;
// #endregion

// #region JunctureTypeMap
export interface JunctureTypeMap {
  readonly [key: string]: JunctureType;
}

// ---  Derivations
export type CursorMapOfJunctureTypeMap<JTM extends JunctureTypeMap> = {
  readonly [K in keyof JTM]: CursorOfType<JTM[K]>;
};
// #endregion
