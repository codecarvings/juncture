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
import { createCursor, Cursor } from './engine/cursor';
import { Gear, GearLayout, GearMediator } from './engine/gear';
import { getGear } from './engine/gear-host';
import { Path } from './engine/path';
import { jSymbols } from './symbols';
import { Initializable } from './tool/initializable';
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

  [jSymbols.createGear](layout: GearLayout, mediator: GearMediator): Gear {
    return new Gear(this, layout, mediator);
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
      ) => getGear(frame._).isMounted));

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
  static getSchema<J extends Juncture>(Type: J): SchemaOf<J>;
  static getSchema() {
    // method implemented below
    return undefined!;
  }

  static createGear(Type: JunctureType, layoyt: GearLayout, mediator: GearMediator): Gear {
    const juncture = Juncture.getInstance(Type);
    return juncture[jSymbols.createGear](layoyt, mediator);
  }
  // #endregion
}

(Juncture as any).getSchema = Singleton.getAttachment(
  junctureSymbols.schemaCache,
  juncture => juncture.schema[jSymbols.payload]()
);

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
