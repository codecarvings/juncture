/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Ctx, CtxConfig, CtxResolver } from './context/ctx';
import { createCursor, Cursor, getCtx } from './context/cursor';
import { Path } from './context/path';
import { Schema, SchemaDef, SchemaOfSchemaDef } from './definition/schema';
import { createDirectSelectorDef, DirectSelectorDef } from './definition/selector';
import { Initializable } from './fabric/initializable';
import { PropertyAssembler, PropertyAssemblerHost } from './fabric/property-assembler';
import { Singleton } from './fabric/singleton';
import { JSymbols, jSymbols } from './symbols';

// --- Symbols
const schemaCacheSymbol = Symbol('schemaCache');
const createCursorCacheSymbol = Symbol('createCursorCache');
const createPrivateCursorCacheSymbol = Symbol('createPrivateCursorCache');
interface JunctureSymbols {
  readonly schemaCache: typeof schemaCacheSymbol;
  readonly createCursorCache: typeof createCursorCacheSymbol;
  readonly createPrivateCursorCache: typeof createPrivateCursorCacheSymbol;
}
const junctureSymbols: JunctureSymbols = {
  schemaCache: schemaCacheSymbol,
  createCursorCache: createCursorCacheSymbol,
  createPrivateCursorCache: createPrivateCursorCacheSymbol
};

export abstract class Juncture implements PropertyAssemblerHost, Initializable {
  [jSymbols.createPropertyAssembler](): PropertyAssembler {
    return new PropertyAssembler(this);
  }

  [jSymbols.init]() {
    PropertyAssembler.get(this).wire();
  }

  [jSymbols.createCtx](config: CtxConfig): Ctx {
    return new Ctx(this, config);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  [jSymbols.createCursor](ctx: Ctx, childCtxResolver: CtxResolver): Cursor<this> {
    return createCursor(ctx);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  [jSymbols.createPrivateCursor](ctx: Ctx, childCtxResolver: CtxResolver): Cursor<this> {
    return ctx.cursor;
  }

  constructor() {
    const assembler = Juncture.getPropertyAssembler(this);

    this.defaultValue = assembler
      .registerStaticProperty(createDirectSelectorDef((
        frame: any
      ) => getCtx(frame._).schema.defaultValue));

    this.path = assembler
      .registerStaticProperty(createDirectSelectorDef((
        frame: any
      ) => getCtx(frame._).layout.path));

    this.isMounted = assembler
      .registerStaticProperty(createDirectSelectorDef(() => true)); // TODO: Implement this

    this.value = assembler
      .registerStaticProperty(createDirectSelectorDef((
        frame: any
      ) => getCtx(frame._).getValue()));
  }

  abstract readonly schema: SchemaDef<Schema>;

  readonly defaultValue: DirectSelectorDef<ValueOf<this>>;

  readonly path: DirectSelectorDef<Path>;

  readonly isMounted: DirectSelectorDef<boolean>;

  readonly value: DirectSelectorDef<ValueOf<this>>;

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

  static createCtx<JT extends JunctureType>(Type: JT, config: CtxConfig) {
    const juncture = Juncture.getInstance(Type);
    return juncture[jSymbols.createCtx](config);
  }

  static createCursor<JT extends JunctureType>(Type: JT, ctx: Ctx, childCtxResolver: CtxResolver): CursorOfType<JT>;
  static createCursor<J extends Juncture>(Type: J, ctx: Ctx, childCtxResolver: CtxResolver): CursorOf<J>;
  static createCursor() {
    // method implemented below
    return undefined!;
  }

  static createPrivateCursor<JT extends JunctureType>(
    Type: JT, ctx: Ctx, childCtxResolver: CtxResolver): PrivateCursorOfType<JT>;
  static createPrivateCursor<J extends Juncture>(Type: J, ctx: Ctx, childCtxResolver: CtxResolver): PrivateCursorOf<J>;
  static createPrivateCursor() {
    // method implemented below
    return undefined!;
  }
}

(Juncture as any).getSchema = Singleton.getSingletonAttachment(
  junctureSymbols.schemaCache,
  juncture => juncture.schema[jSymbols.defPayload]()
);

(Juncture as any).createCursor = Singleton.getSingletonAttachment(
  junctureSymbols.createCursorCache,
  juncture => juncture[jSymbols.createCursor]
);

(Juncture as any).createPrivateCursor = Singleton.getSingletonAttachment(
  junctureSymbols.createPrivateCursorCache,
  juncture => juncture[jSymbols.createPrivateCursor]
);

// ---  Derivations
export type SchemaOf<J extends Juncture> = SchemaOfSchemaDef<J['schema']>;
export type ValueOf<J extends Juncture> = SchemaOfSchemaDef<J['schema']>['defaultValue'];
export type HandledValueOf<J extends Juncture> = SchemaOfSchemaDef<J['schema']>[JSymbols['handledValue']];

// Use inference to keep type name
export type CursorOf<J extends Juncture> = J extends {
  [jSymbols.createCursor](...args : any) : infer C
} ? C : never;
export type PrivateCursorOf<J extends Juncture> = J extends {
  [jSymbols.createPrivateCursor](...args : any) : infer C
} ? C : never;
// #endregion

// #region JunctureType
export interface JunctureType<J extends Juncture = Juncture> {
  new(): J;
}

// ---  Derivations
export type SchemaOfType<JT extends JunctureType> = SchemaOf<InstanceType<JT>>;
export type ValueOfType<JT extends JunctureType> = ValueOf<InstanceType<JT>>;
export type HandledValueOfType<JT extends JunctureType> = HandledValueOf<InstanceType<JT>>;

export type PrivateCursorOfType<JT extends JunctureType> = PrivateCursorOf<InstanceType<JT>>;
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
