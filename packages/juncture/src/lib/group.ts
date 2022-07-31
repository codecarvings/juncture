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
  CursorMapOfJunctureTypeMap, Juncture, JunctureType,
  JunctureTypeMap,
  SchemaOf, ValueOfType
} from '../juncture';
import { jSymbols } from '../symbols';
import { defineLazyProperty, mappedAssign } from '../util/object';

// #region Value & Schema
export type GroupValue<JTM extends JunctureTypeMap> = {
  readonly [K in keyof JTM]: ValueOfType<JTM[K]>;
};
export type GroupHandledValue<JTM extends JunctureTypeMap> = {
  readonly [K in keyof JTM]?: ValueOfType<JTM[K]>;
};

let createGroupSchema: <JTM extends JunctureTypeMap>(
  Children: JTM, defaultValue?: GroupHandledValue<JTM>)
=> GroupSchema<JTM>;

export class GroupSchema<JTM extends JunctureTypeMap = any> extends Schema<GroupValue<JTM>, GroupHandledValue<JTM>> {
  protected constructor(readonly Children: JTM, defaultValue?: GroupHandledValue<JTM>) {
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
    createGroupSchema = <JTM2 extends JunctureTypeMap>(
      Children: JTM2, defaultValue?: GroupHandledValue<JTM2>
    ) => new GroupSchema<JTM2>(Children, defaultValue);
  })();
}
// #endregion

// #region Composer
export class GroupComposer<J extends GroupJuncture> extends Composer<J> {
}
// #endregion

// #region Ctx & Cursors
export class GroupCtxHub extends CtxHub {
  readonly schema!: GroupSchema;

  constructor(ctx: Ctx, config: CtxConfig) {
    super(ctx, config);
    const { setValue } = config.ctxMediator;
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
        const childCtxConfig: CtxConfig = { layout, ctxMediator };
        return Juncture.createCtx(this.schema.Children[key], childCtxConfig);
      }
    );
  }

  protected readonly childCtxs: CtxMap;

  resolve(key: string): Ctx {
    return this.childCtxs[key];
  }
}

export type GroupCursor<J extends GroupJuncture> = Cursor<J> & CursorMapOfJunctureTypeMap<ChildrenOf<J>>;

// #endregion

// #region Juncture
export abstract class GroupJuncture extends ComposableJuncture {
  protected [jSymbols.createComposer](): GroupComposer<this> {
    return new GroupComposer<this>(Juncture.getPropertyAssembler(this));
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createCtxHub](ctx: Ctx, config: CtxConfig): GroupCtxHub {
    return new GroupCtxHub(ctx, config);
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createCursor](hub: GroupCtxHub): GroupCursor<this> {
    const _: any = createCursor(hub.ctx);
    hub.schema.childKeys.forEach(key => {
      defineLazyProperty(_, key, () => hub.resolve(key).cursor, true);
    });
    return _;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  [jSymbols.createPrivateCursor](hub: CtxHub): GroupCursor<this> {
    return hub.ctx.cursor as GroupCursor<this>;
  }

  protected readonly DEF!: GroupComposer<this>;

  abstract readonly schema: SchemaDef<GroupSchema>;
}

// ---  Derivations
export type ChildrenOf<J extends GroupJuncture> = SchemaOf<J>['Children'];
// #endregion

// #region Builder types
// --- Inert
interface Group<JTM extends JunctureTypeMap> extends GroupJuncture {
  schema: SchemaDef<GroupSchema<JTM>>;
}
interface GroupType<JTM extends JunctureTypeMap> extends JunctureType<Group<JTM>> { }
// #endregion

// #region Builder
function createGroupType<JT extends abstract new(...args: any) => GroupJuncture,
  JTM extends JunctureTypeMap>(BaseType: JT, Children: JTM, defaultValue?: GroupHandledValue<JTM>) {
  abstract class Group extends BaseType {
    schema = createSchemaDef(() => createGroupSchema(Children, defaultValue));
  }
  return Group;
}

interface GroupBuilder {
  of<JTM extends JunctureTypeMap>(Children: JTM, defaultValue?: GroupHandledValue<JTM>): GroupType<JTM>;
}

export const jGroup: GroupBuilder = {
  of: <JTM extends JunctureTypeMap>(
    Children: JTM,
    defaultValue?: GroupHandledValue<JTM>
  ) => createGroupType(GroupJuncture, Children, defaultValue) as any
};
// #endregion
