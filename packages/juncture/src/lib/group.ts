/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ComposableJuncture } from '../composable-juncture';
import { Composer } from '../composer';
import { Ctx, CtxConfig, CtxMap } from '../context/ctx';
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
export class GroupComposer<J extends Group> extends Composer<J> {
}
// #endregion

// #region Ctx & Cursors
export class GroupCtx<J extends Group = Group> extends Ctx<J> {
  constructor(juncture: J, config: CtxConfig) {
    super(juncture, config);
    this.childCtxs = mappedAssign(
      {},
      this.schema.childKeys,
      key => Juncture.createCtx(this.schema.Children[key], {
        layout: {
          parent: this,
          path: [...this.layout.path, key],
          isUnivocal: this.layout.isUnivocal,
          isDivergent: false
        }
      })
    );
  }

  protected readonly childCtxs: CtxMap;

  protected createCursor(): GroupCursor<J> {
    const _: any = createCursor(this);
    this.schema.childKeys.forEach(key => {
      defineLazyProperty(_, key, () => this.childCtxs[key].cursor, true);
    });
    return _;
  }

  readonly cursor!: GroupCursor<J>;

  readonly privateCursor!: GroupCursor<J>;
}

export type GroupCursor<J extends Group> = Cursor<J> & CursorMapOfJunctureTypeMap<ChildrenOf<J>>;

// #endregion

// #region Juncture
export abstract class Group extends ComposableJuncture {
  protected [jSymbols.createComposer](): GroupComposer<this> {
    return new GroupComposer<this>(Juncture.getPropertyAssembler(this));
  }

  [jSymbols.createCtx](config: CtxConfig): GroupCtx<this> {
    return new GroupCtx(this, config);
  }

  protected readonly DEF!: GroupComposer<this>;

  abstract readonly schema: SchemaDef<GroupSchema>;
}

// ---  Derivations
export type ChildrenOf<J extends Group> = SchemaOf<J>['Children'];
// #endregion

// #region Builder types
// --- Inert
interface StatedGroup<JTM extends JunctureTypeMap> extends Group {
  schema: SchemaDef<GroupSchema<JTM>>;
}
interface StatedGroupType<JTM extends JunctureTypeMap> extends JunctureType<StatedGroup<JTM>> { }
// #endregion

// #region Builder
function createGroupType<JT extends abstract new(...args: any) => Group,
  JTM extends JunctureTypeMap>(BaseType: JT, Children: JTM, defaultValue?: GroupHandledValue<JTM>) {
  abstract class StatedGroup extends BaseType {
    schema = createSchemaDef(() => createGroupSchema(Children, defaultValue));
  }
  return StatedGroup;
}

interface GroupBuilder {
  of<JTM extends JunctureTypeMap>(Children: JTM, defaultValue?: GroupHandledValue<JTM>): StatedGroupType<JTM>;
}

export const jGroup: GroupBuilder = {
  of: <JTM extends JunctureTypeMap>(
    Children: JTM,
    defaultValue?: GroupHandledValue<JTM>
  ) => createGroupType(Group, Children, defaultValue) as any
};
// #endregion
