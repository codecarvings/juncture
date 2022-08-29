/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier, PrivateJunctureAnnex } from '../access';
import { createSchema, Schema } from '../design/descriptors/schema';
import { SingleChildSchema } from '../design/schema';
import { SchemaOf } from '../driver';
import { EngineRealmMediator } from '../engine';
import { ForgeableDriver } from '../forgeable-driver';
import { Forger } from '../forger';
import {
  AlterablePartialJuncture, Juncture, OuterCursorOfJuncture, ValueOfJuncture
} from '../juncture';
import { createCursor, Cursor } from '../operation/frame-equipment/cursor';
import { PathFragment } from '../operation/path';
import {
  ControlledRealm, Realm, RealmLayout, RealmMediator
} from '../operation/realm';
import { jSymbols } from '../symbols';

// #region Value & Schema
export type ListValue<J extends Juncture> = ReadonlyArray<ValueOfJuncture<J>>;

export class ListSchema<J extends Juncture = any> extends SingleChildSchema<J, ListValue<J>> {
  protected constructor(Child: J, defaultValue?: ListValue<J>) {
    super(Child, defaultValue !== undefined ? defaultValue : []);
  }
}

function createListSchema<J extends Juncture>(
  Child: J,
  defaultValue?: ListValue<J>
): ListSchema<J> {
  return new (ListSchema as any)(Child, defaultValue);
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
  readonly _value!: any[];

  protected valueDidUpdate() {
    this.reconcileChildren();
    this.children.forEach(child => {
      (child.realm as ListRealm).detectValueChange();
    });
  }
  // #endregion

  // #region Children stuff
  protected createChild(index: number): ControlledRealm {
    const layout: RealmLayout = {
      parent: this,
      path: [...this.layout.path, index],
      isUnivocal: false,
      isDivergent: true
    };
    const realmMediator: RealmMediator = {
      getValue: () => this._value[index],
      setValue: childValue => {
        this._value[index] = childValue;
      }
    };

    return this.engineMediator.realm.createControlled(this.schema.Child, layout, realmMediator);
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

  resolveFragment(fragment: PathFragment): Realm {
    if (typeof fragment === 'number') {
      if (fragment >= 0 && fragment < this.children.length) {
        return this.children[fragment].realm;
      }
    }
    return super.resolveFragment(fragment);
  }
  // #endregion
}

export type ListCursor<D extends ListDriver> = Cursor<D> & {
  item(index: number): OuterCursorOfJuncture<ChildOf<D>>;
};

export type OuterListCursor<D extends ListDriver> = Cursor<D> &
(ChildOf<D> extends PrivateJunctureAnnex ? { } : {
  item(index: number): OuterCursorOfJuncture<ChildOf<D>>;
});

// #endregion

// #region Driver
export abstract class ListDriver extends ForgeableDriver {
  protected [jSymbols.createForger](): ListForger<this> {
    return new ListForger(this);
  }

  [jSymbols.createRealm](
    layout: RealmLayout,
    realmMediator: RealmMediator,
    engineMediator: EngineRealmMediator
  ): ListRealm {
    return new ListRealm(this, layout, realmMediator, engineMediator);
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createCursor](realm: ListRealm): ListCursor<this> {
    const _: any = createCursor(realm);
    _.item = (index: number) => realm.resolveFragment(index).outerCursor;
    return _;
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createOuterCursor](realm: ListRealm): OuterListCursor<this> {
    const _: any = createCursor(realm);
    if (realm.schema.childAccess === AccessModifier.public) {
      _.item = (index: number) => realm.resolveFragment(index).outerCursor;
    }
    return _;
  }

  protected readonly FORGE!: ListForger<this>;

  abstract readonly schema: Schema<ListSchema>;

  length = this.FORGE.selector(({ value }) => value().length);
}

// ---  Derivations
export type ChildOf<D extends ListDriver> = SchemaOf<D>['Child'];
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
   J2 extends Juncture>(BaseJuncture: J, Child: J2, defaultValue?: ListValue<J2>) {
  abstract class List extends BaseJuncture {
    schema = createSchema(() => createListSchema(Child, defaultValue));
  }
  return List;
}

interface ListJunctureBuilder {
  Of<J extends Juncture>(Child: J, defaultValue?: ListValue<J>): ListJuncture<J>;
}

export const $List: ListJunctureBuilder = {
  Of: <J extends Juncture>(
    Child: J,
    defaultValue?: ListValue<J>
  ) => createListJuncture(ListDriver, Child, defaultValue) as any
};
// #endregion
