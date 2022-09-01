/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier, OuterCursorMapOfJunctureMap } from '../access';
import { createSchema, Schema } from '../design/descriptors/schema';
import { JunctureSchema } from '../design/schema';
import { SchemaOf } from '../driver';
import { EngineRealmMediator } from '../engine';
import { ForgeableDriver } from '../forgeable-driver';
import { Forger } from '../forger';
import {
  AlterablePartialJuncture, CursorMapOfJunctureMap, Juncture, JunctureMap, ValueOfJuncture
} from '../juncture';
import { createCursor, Cursor } from '../operation/frame-equipment/cursor';
import { PathFragment } from '../operation/path';
import {
  Realm, RealmLayout, RealmMap, RealmMediator
} from '../operation/realm';
import { jSymbols } from '../symbols';
import { defineLazyProperty, mappedAssign } from '../tool/object';

// #region Value & Schema
export type StructValue<JM extends JunctureMap> = {
  readonly [K in keyof JM]: ValueOfJuncture<JM[K]>;
};
export type PartialStructValue<JM extends JunctureMap> = {
  readonly [K in keyof JM]?: ValueOfJuncture<JM[K]>;
};
export class StructSchema<JM extends JunctureMap = any> extends JunctureSchema<StructValue<JM>> {
  protected constructor(readonly Children: JM, defaultValue?: PartialStructValue<JM>) {
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
    this.outerChildKeys = childKeys.filter(key => {
      if (Children[key].access === AccessModifier.private) {
        return false;
      }
      return true;
    });
  }

  readonly childKeys: string[];

  readonly outerChildKeys: string[];
}

function createStructSchema<JM extends JunctureMap>(
  Children: JM,
  defaultValue?: PartialStructValue<JM>
): StructSchema<JM> {
  return new (StructSchema as any)(Children, defaultValue);
}
// #endregion

// #region Forger
export class StructForger<D extends StructDriver> extends Forger<D> {
}
// #endregion

// #region Operation
export class StructRealm extends Realm {
  readonly schema!: StructSchema;

  // #region Value stuff
  protected valueDidUpdate() {
    this.schema.childKeys.forEach(key => {
      this.children[key].detectValueChange();
    });
  }

  protected getHarmonizedValue(value: any): any {
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
  protected createChildren(): RealmMap {
    return mappedAssign(
      {},
      this.schema.childKeys,
      key => {
        const layout: RealmLayout = {
          path: this.engineMediator.realm.getPersistentPath([...this.layout.path, key]),
          parent: this,
          isUnivocal: this.layout.isUnivocal,
          isDivergent: false
        };
        const realmMediator: RealmMediator = {
          getValue: () => this._value[key],
          setValue: childValue => {
            this._value[key] = childValue;
          }
        };
        return Juncture.createRealm(this.schema.Children[key], layout, realmMediator, this.engineMediator);
      }
    );
  }

  protected readonly children: RealmMap = this.createChildren();

  resolveFragment(fragment: PathFragment): Realm {
    const result = this.children[fragment as any];
    if (result) {
      return result;
    }
    return super.resolveFragment(fragment);
  }
  // #endregion
}

export type StructCursor<D extends StructDriver> = Cursor<D> & CursorMapOfJunctureMap<ChildrenOf<D>>;

export type OuterStructCursor<D extends StructDriver> = Cursor<D> & OuterCursorMapOfJunctureMap<ChildrenOf<D>>;

// #endregion

// #region Driver
export abstract class StructDriver extends ForgeableDriver {
  protected [jSymbols.createForger](): StructForger<this> {
    return new StructForger(this);
  }

  [jSymbols.createRealm](
    layout: RealmLayout,
    mediator: RealmMediator,
    engineMediator: EngineRealmMediator
  ): StructRealm {
    return new StructRealm(this, layout, mediator, engineMediator);
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createCursor](realm: StructRealm): StructCursor<this> {
    const _: any = createCursor(realm);
    realm.schema.childKeys.forEach(key => {
      defineLazyProperty(_, key, () => realm.resolveFragment(key).outerCursor, { enumerable: true });
    });
    return _;
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createOuterCursor](realm: StructRealm): OuterStructCursor<this> {
    const _: any = createCursor(realm);
    realm.schema.outerChildKeys.forEach(key => {
      defineLazyProperty(_, key, () => realm.resolveFragment(key).outerCursor, { enumerable: true });
    });
    return _;
  }

  protected readonly FORGE!: StructForger<this>;

  abstract readonly schema: Schema<StructSchema>;
}

// ---  Derivations
export type ChildrenOf<D extends StructDriver> = SchemaOf<D>['Children'];
// #endregion

// #region Juncture
// --- Inert
interface Struct<JM extends JunctureMap> extends StructDriver {
  schema: Schema<StructSchema<JM>>;
}
interface StructJuncture<JM extends JunctureMap> extends Juncture<Struct<JM>> { }
// #endregion

// #region Builder
function createStructJuncture<J extends AlterablePartialJuncture<StructDriver>,
  JM extends JunctureMap>(BaseJuncture: J, Children: JM, defaultValue?: PartialStructValue<JM>) {
  abstract class Struct extends BaseJuncture {
    schema = createSchema(() => createStructSchema(Children, defaultValue));
  }
  return Struct;
}

interface StructJunctureBuilder {
  Of<JM extends JunctureMap>(Children: JM, defaultValue?: PartialStructValue<JM>): StructJuncture<JM>;
}

export const $Struct: StructJunctureBuilder = {
  Of: <JM extends JunctureMap>(
    Children: JM,
    defaultValue?: PartialStructValue<JM>
  ) => createStructJuncture(StructDriver, Children, defaultValue) as any
};
// #endregion
