/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Ctx, CtxLayout, CtxMediator } from './context/ctx';
import { getCtx } from './context/ctx-host';
import { createCursor, Cursor } from './context/cursor';
import { Path } from './context/path';
import { Schema, SchemaDef, SchemaOfSchemaDef } from './definition/schema';
import { createSelectorDef, PubSelectorDef } from './definition/selector';
import { Initializable } from './fabric/initializable';
import { PropertyAssembler, PropertyAssemblerHost } from './fabric/property-assembler';
import { Singleton } from './fabric/singleton';
import { jSymbols } from './symbols';

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

  [jSymbols.createCtx](layout: CtxLayout, mediator: CtxMediator): Ctx {
    return new Ctx(this, layout, mediator);
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createCursor](ctx: Ctx): Cursor<this> {
    return createCursor(ctx) as Cursor<this>;
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createInternalCursor](ctx: Ctx): Cursor<this> {
    return ctx.cursor as Cursor<this>;
  }
  // #endregion

  constructor() {
    const assembler = Juncture.getPropertyAssembler(this);

    this.defaultValue = assembler
      .registerStaticProperty(createSelectorDef((
        frame: any
      ) => getCtx(frame._).schema.defaultValue));

    this.path = assembler
      .registerStaticProperty(createSelectorDef((
        frame: any
      ) => getCtx(frame._).layout.path));

    this.isMounted = assembler
      .registerStaticProperty(createSelectorDef((
        frame: any
      ) => getCtx(frame._).isMounted));

    this.value = assembler
      .registerStaticProperty(createSelectorDef((
        frame: any
      ) => getCtx(frame._).value));
  }

  // #region Defs
  abstract readonly schema: SchemaDef<Schema>;

  readonly defaultValue: PubSelectorDef<ValueOf<this>>;

  readonly path: PubSelectorDef<Path>;

  readonly isMounted: PubSelectorDef<boolean>;

  readonly value: PubSelectorDef<ValueOf<this>>;
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

  static createCtx(Type: JunctureType, layoyt: CtxLayout, mediator: CtxMediator): Ctx {
    const juncture = Juncture.getInstance(Type);
    return juncture[jSymbols.createCtx](layoyt, mediator);
  }
  // #endregion
}

(Juncture as any).getSchema = Singleton.getAttachment(
  junctureSymbols.schemaCache,
  juncture => juncture.schema[jSymbols.defPayload]()
);

// ---  Derivations
export type SchemaOf<J extends Juncture> = SchemaOfSchemaDef<J['schema']>;
export type ValueOf<J extends Juncture> = SchemaOfSchemaDef<J['schema']>['defaultValue'];

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
