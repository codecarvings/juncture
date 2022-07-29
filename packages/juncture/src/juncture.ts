/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Ctx, CtxConfig } from './context/ctx';
import { CtxHub } from './context/ctx-hub';
import { createCursor, Cursor, getCtx } from './context/cursor';
import { Path } from './context/path';
import { Schema, SchemaDef, SchemaOfSchemaDef } from './definition/schema';
import { createDirectSelectorDef, DirectSelectorDef } from './definition/selector';
import { Initializable } from './fabric/initializable';
import { PropertyAssembler, PropertyAssemblerHost } from './fabric/property-assembler';
import { Singleton } from './fabric/singleton';
import { JSymbols, jSymbols } from './symbols';

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

  [jSymbols.createCtx](config: CtxConfig): Ctx {
    return new Ctx(this, config);
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createCtxHub](ctx: Ctx, config: CtxConfig): CtxHub {
    return new CtxHub(ctx, config);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  [jSymbols.createCursor](hub: CtxHub): Cursor<this> {
    return createCursor(hub.ctx) as Cursor<this>;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  [jSymbols.createPrivateCursor](hub: CtxHub): Cursor<this> {
    return hub.ctx.cursor as Cursor<this>;
  }
  // #endregion

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

  // #region Defs
  abstract readonly schema: SchemaDef<Schema>;

  readonly defaultValue: DirectSelectorDef<ValueOf<this>>;

  readonly path: DirectSelectorDef<Path>;

  readonly isMounted: DirectSelectorDef<boolean>;

  readonly value: DirectSelectorDef<ValueOf<this>>;
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

  static createCtx<JT extends JunctureType>(Type: JT, config: CtxConfig) {
    const juncture = Juncture.getInstance(Type);
    return juncture[jSymbols.createCtx](config);
  }

  static createCtxHub<JT extends JunctureType>(Type: JT, ctx: Ctx, config: CtxConfig) {
    const juncture = Juncture.getInstance(Type);
    return juncture[jSymbols.createCtxHub](ctx, config);
  }

  static createCursor<JT extends JunctureType>(Type: JT, hub: CtxHub): CursorOfType<JT> {
    const juncture = Juncture.getInstance(Type);
    return juncture[jSymbols.createCursor](hub) as CursorOfType<JT>;
  }

  static createPrivateCursor<JT extends JunctureType>(Type: JT, hub: CtxHub): PrivateCursorOfType<JT> {
    const juncture = Juncture.getInstance(Type);
    return juncture[jSymbols.createPrivateCursor](hub) as PrivateCursorOfType<JT>;
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
export type HandledValueOf<J extends Juncture> = SchemaOfSchemaDef<J['schema']>[JSymbols['handledValue']];

// export type CtxHubOf<J extends Juncture> = ReturnType<J[typeof jSymbols.createCtxHub]>;
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
