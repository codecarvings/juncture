/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../access-modifier';
import { createSchema, Schema } from '../design/descriptors/schema';
import { SchemaOf } from '../driver';
import { EngineRealmMediator } from '../engine';
import { ForgeableDriver } from '../forgeable-driver';
import { Forger } from '../forger';
import {
  AlterablePartialJuncture, CursorMapOfJunctureMap, Juncture, JunctureMap, ValueOfJuncture, XpCursorMapOfJunctureMap
} from '../juncture';
import { junctureSymbols } from '../juncture-symbols';
import { createCursor, Cursor } from '../operation/frame-equipment/cursor';
import { PathFragment } from '../operation/path';
import {
  Realm, RealmLayout, RealmMap, RealmMediator
} from '../operation/realm';
import { JunctureSchema } from '../schema';
import { defineLazyProperty, mappedAssign } from '../utilities/object';

// #region Value & Schema
export type StructValue<JM extends JunctureMap> = {
  readonly [K in keyof JM]: ValueOfJuncture<JM[K]>;
};
export type StructPartialValue<JM extends JunctureMap> = {
  readonly [K in keyof JM]?: ValueOfJuncture<JM[K]>;
};
export class StructSchema<JM extends JunctureMap = JunctureMap> extends JunctureSchema<StructValue<JM>> {
  protected constructor(readonly children: JM, defaultValue?: StructPartialValue<JM>) {
    const childKeys = Object.keys(children);
    const childDefaultValue = mappedAssign(
      { },
      childKeys,
      key => Juncture.getSchema(children[key]).defaultValue
    );
    const mergedDefaultValue = defaultValue !== undefined ? {
      ...childDefaultValue,
      ...defaultValue
    } : childDefaultValue;
    super(mergedDefaultValue);
    this.childKeys = childKeys;
    this.xpChildKeys = childKeys.filter(key => {
      if (children[key].access === AccessModifier.private) {
        return false;
      }
      return true;
    });
  }

  readonly childKeys: string[];

  readonly xpChildKeys: string[];
}

function createStructSchema<JM extends JunctureMap>(
  children: JM,
  defaultValue?: StructPartialValue<JM>
): StructSchema<JM> {
  return new (StructSchema as any)(children, defaultValue);
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
    const { setValue } = this.realmMediator;

    return mappedAssign(
      {},
      this.schema.childKeys,
      key => {
        const layout: RealmLayout = {
          path: this.engineMediator.persistentPath.get([...this.layout.path, key]),
          parent: this,
          isUnivocal: this.layout.isUnivocal,
          isDivergent: false
        };
        const realmMediator: RealmMediator = {
          getValue: () => this._value[key],
          setValue: childValue => {
            this._value = {
              ...this._value,
              [key]: childValue
            };
            setValue(this._value);
          }
        };
        return Juncture.createRealm(this.schema.children[key], layout, realmMediator, this.engineMediator);
      }
    );
  }

  protected readonly children: RealmMap = this.createChildren();

  getChildRealm(fragment: PathFragment): Realm {
    const result = this.children[fragment as any];
    if (result) {
      return result;
    }
    return super.getChildRealm(fragment);
  }
  // #endregion
}

export type StructCursor<D extends StructDriver> = Cursor<D> & CursorMapOfJunctureMap<ChildrenOf<D>>;
export type StructXpCursor<D extends StructDriver> = Cursor<D> & XpCursorMapOfJunctureMap<ChildrenOf<D>>;
// #endregion

// #region Driver
export abstract class StructDriver extends ForgeableDriver {
  protected [junctureSymbols.createForger](): StructForger<this> {
    return new StructForger(this);
  }

  [junctureSymbols.createRealm](
    layout: RealmLayout,
    mediator: RealmMediator,
    engineMediator: EngineRealmMediator
  ): StructRealm {
    return new StructRealm(this, layout, mediator, engineMediator);
  }

  // eslint-disable-next-line class-methods-use-this
  [junctureSymbols.createCursor](realm: StructRealm): StructCursor<this> {
    const _: any = createCursor(realm);
    realm.schema.childKeys.forEach(key => {
      defineLazyProperty(_, key, () => realm.getChildRealm(key).xpCursor, { enumerable: true });
    });
    return _;
  }

  // eslint-disable-next-line class-methods-use-this
  [junctureSymbols.createXpCursor](realm: StructRealm): StructXpCursor<this> {
    const _: any = createCursor(realm);
    realm.schema.xpChildKeys.forEach(key => {
      defineLazyProperty(_, key, () => realm.getChildRealm(key).xpCursor, { enumerable: true });
    });
    return _;
  }

  protected readonly FORGE!: StructForger<this>;

  abstract readonly schema: Schema<StructSchema>;
}

// ---  Derivations
export type ChildrenOf<D extends StructDriver> = SchemaOf<D>['children'];
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
  JM extends JunctureMap>(baseJuncture: J, children: JM, defaultValue?: StructPartialValue<JM>) {
  abstract class Struct extends baseJuncture {
    schema = createSchema(() => createStructSchema(children, defaultValue));
  }
  return Struct;
}

interface StructJunctureBuilder {
  of<JM extends JunctureMap>(children: JM, defaultValue?: StructPartialValue<JM>): StructJuncture<JM>;
}

export const STRUCT: StructJunctureBuilder = {
  of<JM extends JunctureMap>(
    children: JM,
    defaultValue?: StructPartialValue<JM>
  ) {
    return createStructJuncture(StructDriver, children, defaultValue) as any;
  }
};
// #endregion
