/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ComposableJuncture } from '../composable-juncture';
import { Composer } from '../composer';
import {
  Ctx, CtxConfig, CtxLayout, CtxMap, CtxMediator
} from '../context/ctx';
import { CtxHub } from '../context/ctx-hub';
import { createCursor, Cursor } from '../context/cursor';
import { createSchemaDef, Schema, SchemaDef } from '../definition/schema';
import {
  CursorMapOfJunctureTypeMap, HandledValueOf, Juncture, JunctureType,
  JunctureTypeMap,
  SchemaOf, ValueOf, ValueOfType
} from '../juncture';
import { jSymbols } from '../symbols';
import { defineLazyProperty, mappedAssign } from '../util/object';

// #region Value & Schema
export type StructValue<JTM extends JunctureTypeMap> = {
  readonly [K in keyof JTM]: ValueOfType<JTM[K]>;
};
export type StructHandledValue<JTM extends JunctureTypeMap> = {
  readonly [K in keyof JTM]?: ValueOfType<JTM[K]>;
};

let createStructSchema: <JTM extends JunctureTypeMap>(
  Children: JTM, defaultValue?: StructHandledValue<JTM>)
=> StructSchema<JTM>;

export class StructSchema<JTM extends JunctureTypeMap = any> extends Schema<StructValue<JTM>, StructHandledValue<JTM>> {
  protected constructor(readonly Children: JTM, defaultValue?: StructHandledValue<JTM>) {
    const childKeys = Object.keys(Children);
    const childDefaultValue = mappedAssign(
      { },
      childKeys,
      key => Juncture.getSchema(Children[key]).defaultValue
    );
    const mergedDefaultValue = defaultValue !== undefined ? {
      ...childDefaultValue,
      ...defaultValue
    } : childDefaultValue;
    super(mergedDefaultValue);
    this.childKeys = childKeys;
  }

  readonly childKeys: string[];

  static #staticInit = (() => {
    createStructSchema = <JTM2 extends JunctureTypeMap>(
      Children: JTM2, defaultValue?: StructHandledValue<JTM2>
    ) => new StructSchema<JTM2>(Children, defaultValue);
  })();
}
// #endregion

// #region Composer
export class StructComposer<J extends StructJuncture> extends Composer<J> {
}
// #endregion

// #region Ctx & Cursors
export class StructCtxHub extends CtxHub {
  readonly schema!: StructSchema;

  constructor(ctx: Ctx, config: CtxConfig) {
    super(ctx, config);
    const { setValue } = config.ctxMediator;
    const { rootMediator } = config;
    this.childCtxs = mappedAssign(
      {},
      this.schema.childKeys,
      key => {
        const layout: CtxLayout = {
          parent: this.ctx,
          path: [...config.layout.path, key],
          isUnivocal: config.layout.isUnivocal,
          isDivergent: false
        };
        const ctxMediator: CtxMediator = {
          getValue: () => ctx.value[key],
          setValue: newValue => {
            setValue({
              ...ctx.value,
              [key]: newValue
            });
          }
        };
        const childCtxConfig: CtxConfig = { layout, ctxMediator, rootMediator };
        return Juncture.createCtx(this.schema.Children[key], childCtxConfig);
      }
    );
  }

  protected readonly childCtxs: CtxMap;

  resolve(key: string): Ctx {
    return this.childCtxs[key];
  }
}

export type StructCursor<J extends StructJuncture> = Cursor<J> & CursorMapOfJunctureTypeMap<ChildrenOf<J>>;

// #endregion

// #region Juncture
export abstract class StructJuncture extends ComposableJuncture {
  protected [jSymbols.createComposer](): StructComposer<this> {
    return new StructComposer<this>(Juncture.getPropertyAssembler(this));
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createCtxHub](ctx: Ctx, config: CtxConfig): StructCtxHub {
    return new StructCtxHub(ctx, config);
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createCursor](hub: StructCtxHub): StructCursor<this> {
    const _: any = createCursor(hub.ctx);
    hub.schema.childKeys.forEach(key => {
      defineLazyProperty(_, key, () => hub.resolve(key).cursor, true);
    });
    return _;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  [jSymbols.createPrivateCursor](hub: CtxHub): StructCursor<this> {
    return hub.ctx.cursor as StructCursor<this>;
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.adaptHandledValue](value: ValueOf<this>, handledValue: HandledValueOf<this>): ValueOf<this> {
    if (handledValue === value) {
      return handledValue;
    }
    return {
      ...value,
      ...handledValue
    };
  }

  protected readonly DEF!: StructComposer<this>;

  abstract readonly schema: SchemaDef<StructSchema>;
}

// ---  Derivations
export type ChildrenOf<J extends StructJuncture> = SchemaOf<J>['Children'];
// #endregion

// #region Builder types
// --- Inert
interface Struct<JTM extends JunctureTypeMap> extends StructJuncture {
  schema: SchemaDef<StructSchema<JTM>>;
}
interface StructType<JTM extends JunctureTypeMap> extends JunctureType<Struct<JTM>> { }
// #endregion

// #region Builder
function createStructType<JT extends abstract new(...args: any) => StructJuncture,
  JTM extends JunctureTypeMap>(BaseType: JT, Children: JTM, defaultValue?: StructHandledValue<JTM>) {
  abstract class Struct extends BaseType {
    schema = createSchemaDef(() => createStructSchema(Children, defaultValue));
  }
  return Struct;
}

interface StructBuilder {
  of<JTM extends JunctureTypeMap>(Children: JTM, defaultValue?: StructHandledValue<JTM>): StructType<JTM>;
}

export const jStruct: StructBuilder = {
  of: <JTM extends JunctureTypeMap>(
    Children: JTM,
    defaultValue?: StructHandledValue<JTM>
  ) => createStructType(StructJuncture, Children, defaultValue) as any
};
// #endregion
