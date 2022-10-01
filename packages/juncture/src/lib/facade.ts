/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
import { PathFragment } from '../operation/path';
import { Realm, RealmLayout, RealmMediator } from '../operation/realm';
import { SingleChildSchema } from '../schema';
import { defineLazyProperty } from '../utilities/object';

// #region Value & Schema
export type FacadeValue<J extends Juncture> = ValueOfJuncture<J>;

export class FacadeSchema<J extends Juncture = Juncture> extends SingleChildSchema<J, FacadeValue<J>> {
  protected constructor(child: J, defaultValue?: FacadeValue<J>) {
    super(child, defaultValue !== undefined ? defaultValue : Juncture.getSchema(child).defaultValue);
  }
}

function createFacadeSchema<J extends Juncture>(
  child: J,
  defaultValue?: FacadeValue<J>
): FacadeSchema<J> {
  return new (FacadeSchema as any)(child, defaultValue);
}
// #endregion

// #region Forger
export class FacadeForger<D extends FacadeDriver> extends Forger<D> { }
// #endregion

// #region Operation
const childKey = 'inner';

export class FacadeRealm extends Realm {
  readonly schema!: FacadeSchema;

  // #region Value stuff
  protected valueDidUpdate() {
    this.child.detectValueChange();
  }
  // #endregion

  // #region Children stuff
  protected createChild(): Realm {
    const layout: RealmLayout = {
      path: this.engineMediator.persistentPath.get([...this.layout.path, childKey]),
      parent: this,
      isUnivocal: this.layout.isUnivocal,
      isDivergent: false
    };
    const realmMediator: RealmMediator = {
      getValue: () => this._value,
      setValue: childValue => {
        this._value = childValue;
        // Not a container...
        this.realmMediator.setValue(this._value);
      }
    };
    return Juncture.createRealm(this.schema.child, layout, realmMediator, this.engineMediator);
  }

  protected readonly child: Realm = this.createChild();

  getChildRealm(fragment: PathFragment): Realm {
    if (fragment === childKey) {
      return this.child;
    }
    return super.getChildRealm(fragment);
  }
  // #endregion
}

export type FacadeCursor<D extends FacadeDriver> = Cursor<D> & {
  readonly inner: XpCursorOf<ChildOf<D>>;
};

export type FacadeXpCursor<D extends FacadeDriver> = Cursor<D>;

// #endregion

// #region Driver
export abstract class FacadeDriver extends ForgeableDriver {
  protected [junctureSymbols.createForger](): FacadeForger<this> {
    return new FacadeForger(this);
  }

  [junctureSymbols.createRealm](
    layout: RealmLayout,
    realmMediator: RealmMediator,
    engineMediator: EngineRealmMediator
  ): FacadeRealm {
    return new FacadeRealm(this, layout, realmMediator, engineMediator);
  }

  // eslint-disable-next-line class-methods-use-this
  [junctureSymbols.createCursor](realm: FacadeRealm): FacadeCursor<this> {
    const _: any = createCursor(realm);
    defineLazyProperty(_, childKey, () => realm.getChildRealm(childKey).xpCursor, { enumerable: true });
    return _;
  }

  [junctureSymbols.createXpCursor](realm: Realm): FacadeXpCursor<this> {
    return super[junctureSymbols.createXpCursor](realm);
  }

  protected readonly FORGE!: FacadeForger<this>;

  abstract readonly schema: Schema<FacadeSchema>;
}

// ---  Derivations
export type ChildOf<D extends FacadeDriver> = SchemaOf<D>['child'];
// #endregion

// #region Juncture
// --- Inert
interface Facade<J extends Juncture> extends FacadeDriver {
  schema: Schema<FacadeSchema<J>>;
}
interface FacadeJuncture<J extends Juncture> extends Juncture<Facade<J>> { }
// #endregion

// #region Builder
function createFacadeJuncture<J extends AlterablePartialJuncture<FacadeDriver>,
  J2 extends Juncture>(baseJuncture: J, child: J2, defaultValue?: FacadeValue<J2>) {
  abstract class Facade extends baseJuncture {
    schema = createSchema(() => createFacadeSchema(child, defaultValue));
  }
  return Facade;
}

interface FacadeJunctureBuilder {
  of<J extends Juncture>(child: J, defaultValue?: FacadeValue<J>): FacadeJuncture<J>;
}

export const FACADE: FacadeJunctureBuilder = {
  of<J extends Juncture>(
    child: J,
    defaultValue?: FacadeValue<J>
  ) {
    return createFacadeJuncture(FacadeDriver, child, defaultValue) as any;
  }
};
// #endregion
