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
  Ctx, CtxLayout, CtxMediator, ManagedCtxMap
} from '../context/ctx';
import { createCursor, Cursor } from '../context/cursor';
import { PathFragment } from '../context/path';
import { createSchemaDef, Schema, SchemaDef } from '../definition/schema';
import {
  CursorMapOfJunctureTypeMap, Juncture, JunctureType,
  JunctureTypeMap,
  SchemaOf, ValueOfType
} from '../juncture';
import { jSymbols } from '../symbols';
import { defineLazyProperty, mappedAssign } from '../util/object';

// #region Value & Schema
export type StructValue<JTM extends JunctureTypeMap> = {
  readonly [K in keyof JTM]: ValueOfType<JTM[K]>;
};
export type PartialStructValue<JTM extends JunctureTypeMap> = {
  readonly [K in keyof JTM]?: ValueOfType<JTM[K]>;
};

let createStructSchema: <JTM extends JunctureTypeMap>(
  Children: JTM, defaultValue?: PartialStructValue<JTM>)
=> StructSchema<JTM>;

export class StructSchema<JTM extends JunctureTypeMap = any> extends Schema<StructValue<JTM>> {
  protected constructor(readonly Children: JTM, defaultValue?: PartialStructValue<JTM>) {
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
      Children: JTM2, defaultValue?: PartialStructValue<JTM2>
    ) => new StructSchema<JTM2>(Children, defaultValue);
  })();
}
// #endregion

// #region Composer
export class StructComposer<J extends StructJuncture> extends Composer<J> {
}
// #endregion

// #region Ctx & Cursors
export class StructCtx extends Ctx {
  readonly schema!: StructSchema;

  // #region Value stuff
  protected valueDidUpdate(): void {
    this.schema.childKeys.forEach(key => {
      this.children[key].ctx.detectValueChange();
    });
  }

  getHarmonizedValue(value: any): any {
    if (value === this._value) {
      return value;
    }
    return {
      ...this._value,
      ...value
    };
  }
  // #endregion

  // #region Children stuff
  protected createChildren(): ManagedCtxMap {
    const { setValue } = this.mediator;
    return mappedAssign(
      {},
      this.schema.childKeys,
      key => {
        let unmount: () => void = undefined!;
        const layout: CtxLayout = {
          parent: this,
          path: [...this.layout.path, key],
          isUnivocal: this.layout.isUnivocal,
          isDivergent: false
        };
        const mediator: CtxMediator = {
          ...this.mediator,
          enroll: um => { unmount = um; },
          getValue: () => this._value[key],
          setValue: newValue => {
            setValue({
              ...this._value,
              [key]: newValue
            });
          }
        };
        const ctx = Juncture.createCtx(this.schema.Children[key], layout, mediator);
        return { ctx, unmount };
      }
    );
  }

  protected readonly children: ManagedCtxMap = this.createChildren();

  resolveFragment(fragment: PathFragment): Ctx {
    const result = this.children[fragment as any];
    if (result) {
      return result.ctx;
    }
    return super.resolveFragment(fragment);
  }
  // #endregion

  // #region Mount stuff
  protected ctxWillUnmount(): void {
    super.ctxWillUnmount();
    this.schema.childKeys.forEach(key => this.children[key].unmount());
  }
  // #endregion
}

export type StructCursor<J extends StructJuncture> = Cursor<J> & CursorMapOfJunctureTypeMap<ChildrenOf<J>>;

// #endregion

// #region Juncture
export abstract class StructJuncture extends ComposableJuncture {
  protected [jSymbols.createComposer](): StructComposer<this> {
    return new StructComposer<this>(Juncture.getPropertyAssembler(this));
  }

  [jSymbols.createCtx](layout: CtxLayout, mediator: CtxMediator): StructCtx {
    return new StructCtx(this, layout, mediator);
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createCursor](ctx: StructCtx): StructCursor<this> {
    const _: any = createCursor(ctx);
    ctx.schema.childKeys.forEach(key => {
      defineLazyProperty(_, key, () => ctx.resolveFragment(key).cursor, { enumerable: true });
    });
    return _;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  [jSymbols.createInternalCursor](ctx: StructCtx): StructCursor<this> {
    return ctx.cursor as StructCursor<this>;
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
  JTM extends JunctureTypeMap>(BaseType: JT, Children: JTM, defaultValue?: PartialStructValue<JTM>) {
  abstract class Struct extends BaseType {
    schema = createSchemaDef(() => createStructSchema(Children, defaultValue));
  }
  return Struct;
}

interface StructBuilder {
  of<JTM extends JunctureTypeMap>(Children: JTM, defaultValue?: PartialStructValue<JTM>): StructType<JTM>;
}

export const jStruct: StructBuilder = {
  of: <JTM extends JunctureTypeMap>(
    Children: JTM,
    defaultValue?: PartialStructValue<JTM>
  ) => createStructType(StructJuncture, Children, defaultValue) as any
};
// #endregion
