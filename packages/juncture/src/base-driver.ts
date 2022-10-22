/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Schema } from './design/descriptors/schema';
import { createSelector, Selector } from './design/descriptors/selector';
import { Driver, ValueOf } from './driver';
import { EngineRealmMediator } from './engine';
import { Juncture } from './juncture';
import { junctureSymbols } from './juncture-symbols';
import { createCursor, Cursor } from './operation/frame-equipment/cursor';
import { Path } from './operation/path';
import {
  Realm, RealmLayout, RealmMediator, RealmMountCondition
} from './operation/realm';
import { getRealm } from './operation/realm-host';
import { JunctureSchema } from './schema';
import { Setup } from './setup';
import { PropertyAssembler } from './utilities/property-assembler';

export abstract class BaseDriver implements Driver {
  static readonly [junctureSymbols.juncture] = true;

  readonly [junctureSymbols.driver] = true;

  // #region Operation stuff
  [junctureSymbols.createPropertyAssembler](): PropertyAssembler {
    return new PropertyAssembler(this);
  }

  [junctureSymbols.init]() {
    PropertyAssembler.get(this).wire();
    Juncture.getSetup(this); // Perform checks
  }

  [junctureSymbols.createSetup](): Setup {
    return new Setup(this);
  }

  [junctureSymbols.createRealm](
    layout: RealmLayout,
    realmMediator: RealmMediator,
    engineMediator: EngineRealmMediator
  ): Realm {
    return new Realm(this, layout, realmMediator, engineMediator);
  }

  // eslint-disable-next-line class-methods-use-this
  [junctureSymbols.createCursor](realm: Realm): Cursor<this> {
    // To save memory by detault use the exposed cursor only.
    // Derivate Junctures can return the right cursor.
    return realm.xpCursor as Cursor<this>;
  }

  // eslint-disable-next-line class-methods-use-this
  [junctureSymbols.createXpCursor](realm: Realm): Cursor<this> {
    return createCursor(realm);
  }
  // #endregion

  constructor() {
    const assembler = PropertyAssembler.get(this);

    this['selector.defaultValue'] = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getRealm(frame._).schema.defaultValue));

    this['selector.path'] = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getRealm(frame._).layout.path));

    this['selector.serviceId'] = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getRealm(frame._).layout.path[0] as string));

    this['selector.isMounted'] = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getRealm(frame._).mountCondition === RealmMountCondition.mounted));

    this['selector.value'] = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getRealm(frame._).value));

    this['selector.juncture'] = assembler
      .registerStaticProperty(createSelector(() => this.constructor as Juncture<this>));
  }

  // #region Descriptors
  abstract readonly schema: Schema<JunctureSchema>;

  readonly 'selector.defaultValue': Selector<ValueOf<this>>;

  readonly 'selector.path': Selector<Path>;

  readonly 'selector.serviceId': Selector<string>;

  readonly 'selector.isMounted': Selector<boolean>;

  readonly 'selector.value': Selector<ValueOf<this>>;

  readonly 'selector.juncture': Selector<Juncture<this>>;
  // #endregion
}
