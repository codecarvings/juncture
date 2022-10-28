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
  AlterablePartialJuncture, Juncture, ValueOfJuncture, XpCursorOf
} from '../juncture';
import { junctureSymbols } from '../juncture-symbols';
import { createCursor, Cursor } from '../operation/frame-equipment/cursor';
import {
  createDetachedCursor,
  DetachedCursor,
  DetachedCursorParent
} from '../operation/frame-equipment/detached-cursor';
import { PathFragment } from '../operation/path';
import {
  ControlledRealm, Realm, RealmLayout, RealmMediator
} from '../operation/realm';
import { PrivateJunctureAnnex } from '../private-juncture';
import { SingleChildSchema } from '../schema';

// #region Private Symbols
const getChildCursorSymbol = Symbol('getChildCursor');
interface PrvSymbols {
  readonly getChildCursor: typeof getChildCursorSymbol;
}
const prvSymbols: PrvSymbols = {
  getChildCursor: getChildCursorSymbol
};
// #endregion

// #region Value & Schema
export type ListValue<J extends Juncture> = ReadonlyArray<ValueOfJuncture<J>>;

export class ListSchema<J extends Juncture = Juncture> extends SingleChildSchema<J, ListValue<J>> {
  protected constructor(child: J, defaultValue?: ListValue<J>) {
    super(child, defaultValue !== undefined ? defaultValue : []);
  }
}

function createListSchema<J extends Juncture>(
  child: J,
  defaultValue?: ListValue<J>
): ListSchema<J> {
  return new (ListSchema as any)(child, defaultValue);
}
// #endregion

// #region Forger
export class ListForger<D extends ListDriver> extends Forger<D> {
}
// #endregion

// #region Operation
export class ListRealm extends Realm {
  readonly schema!: ListSchema;

  // #region Value stuff
  _value!: any[];

  protected valueDidUpdate() {
    this.reconcileChildren();
    this.children.forEach(child => {
      (child.realm as ListRealm).syncValue();
    });
  }
  // #endregion

  // #region Children stuff
  protected createChild(index: number): ControlledRealm {
    const { setValue } = this.realmMediator;

    const layout: RealmLayout = {
      path: this.engineMediator.persistentPath.get([...this.layout.path, index]),
      parent: this,
      isUnivocal: false,
      isDivergent: true
    };
    const realmMediator: RealmMediator = {
      getValue: () => this._value[index],
      setValue: childValue => {
        this._value = this._value.slice();
        this._value[index] = childValue;
        setValue(this._value);
      }
    };

    return this.engineMediator.realm.createControlled(this.schema.child, layout, realmMediator);
  }

  protected createChildren(): ControlledRealm[] {
    return this._value.map((_v, index) => this.createChild(index));
  }

  protected readonly children: ControlledRealm[] = this.createChildren();

  protected reconcileChildren() {
    const valueLen = this._value.length;
    const childrenLen = this.children.length;

    if (valueLen === childrenLen) {
      return;
    } if (valueLen > childrenLen) {
      this.children.length = valueLen;
      for (let i = childrenLen; i < valueLen; i += 1) {
        this.children[i] = this.createChild(i);
      }
    } else {
      const childToUnmount = this.children.slice(valueLen);
      this.children.length = valueLen;
      childToUnmount.forEach(child => child.scheduleUnmount());
    }
  }

  getChildRealm(childKey: PathFragment) {
    const fragmentType = typeof childKey;
    if (fragmentType !== 'number') {
      return this.throwGetChildRealmError(childKey, `Invalid List child key type (${fragmentType}).`);
    }
    if (childKey < 0) {
      return this.throwGetChildRealmError(childKey, 'Invalid List child key (negative).');
    }

    if (childKey < this.children.length) {
      return this.children[childKey as number].realm;
    }
    return undefined;
  }

  [prvSymbols.getChildCursor](index: number): Cursor | DetachedCursor {
    if (index < 0) {
      throw Error(`Invalid negative index: ${index}.`);
    }
    if (index < this.children.length) {
      return this.children[index].realm.xpCursor;
    }
    return Juncture.createDetachedXpCursor(this.schema.child, this, index);
  }
  // #endregion
}

export type ListCursor<D extends ListDriver> = Cursor<D> & {
  item(index: number): XpCursorOf<ChildOf<D>>;
};

export type ListXpCursor<D extends ListDriver> = Cursor<D> &
(ChildOf<D> extends PrivateJunctureAnnex ? { } : {
  item(index: number): XpCursorOf<ChildOf<D>>;
});

// #endregion

// #region Driver
export abstract class ListDriver extends ForgeableDriver {
  protected [junctureSymbols.createForger](): ListForger<this> {
    return new ListForger(this);
  }

  [junctureSymbols.createRealm](
    layout: RealmLayout,
    realmMediator: RealmMediator,
    engineMediator: EngineRealmMediator
  ): ListRealm {
    return new ListRealm(this, layout, realmMediator, engineMediator);
  }

  // eslint-disable-next-line class-methods-use-this
  [junctureSymbols.createCursor](realm: ListRealm): ListCursor<this> {
    const _: any = createCursor(realm);
    _.item = (index: number) => realm[prvSymbols.getChildCursor](index);
    return _;
  }

  // eslint-disable-next-line class-methods-use-this
  [junctureSymbols.createXpCursor](realm: ListRealm): ListXpCursor<this> {
    const _: any = createCursor(realm);
    if (realm.schema.childAccess === AccessModifier.public) {
      _.item = (index: number) => realm[prvSymbols.getChildCursor](index);
    }
    return _;
  }

  [junctureSymbols.createDetachedXpCursor](parent: DetachedCursorParent, key: PathFragment): DetachedCursor {
    const _: any = createDetachedCursor(this, parent, key);
    const schema = Juncture.getSchema(this);
    if (schema.childAccess === AccessModifier.public) {
      _.item = (index: number) => Juncture.createDetachedXpCursor(schema.child, _, index);
    }
    return _;
  }

  protected readonly FORGE!: ListForger<this>;

  abstract readonly schema: Schema<ListSchema>;

  'selector.length' = this.FORGE.selector(
    ({ get }) => get().length
  );
}

// ---  Derivations
export type ChildOf<D extends ListDriver> = SchemaOf<D>['child'];
// #endregion

// #region Juncture
// --- Inert
interface List<J extends Juncture> extends ListDriver {
  schema: Schema<ListSchema<J>>;
}
interface ListJuncture<J extends Juncture> extends Juncture<List<J>> { }
// #endregion

// #region Builder
function createListJuncture<J extends AlterablePartialJuncture<ListDriver>,
   J2 extends Juncture>(baseJuncture: J, child: J2, defaultValue?: ListValue<J2>) {
  abstract class List extends baseJuncture {
    schema = createSchema(() => createListSchema(child, defaultValue));
  }
  return List;
}

interface ListJunctureBuilder {
  of<J extends Juncture>(child: J, defaultValue?: ListValue<J>): ListJuncture<J>;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LIST: ListJunctureBuilder = {
  of<J extends Juncture>(
    child: J,
    defaultValue?: ListValue<J>
  ) {
    return createListJuncture(ListDriver, child, defaultValue) as any;
  }
};
// #endregion
