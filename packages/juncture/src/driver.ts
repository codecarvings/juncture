/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BodyOfSchema, Schema } from './design/descriptors/schema';
import { Selector } from './design/descriptors/selector';
import { EngineRealmMediator } from './engine';
import { Juncture } from './juncture';
import { junctureSymbols } from './juncture-symbols';
import { Cursor } from './operation/frame-equipment/cursor';
import { DetachedCursor, DetachedCursorParent } from './operation/frame-equipment/detached-cursor';
import { Path, PathFragment } from './operation/path';
import {
  Realm, RealmLayout, RealmMediator
} from './operation/realm';
import { JunctureSchema } from './schema';
import { Setup } from './setup';
import { Initializable } from './utilities/initializable';
import { PropertyAssemblerHost } from './utilities/property-assembler';

export interface Driver extends PropertyAssemblerHost, Initializable {
  readonly [junctureSymbols.driver]: true;

  [junctureSymbols.createSetup](): Setup;

  [junctureSymbols.createRealm](
    layout: RealmLayout,
    realmMediator: RealmMediator,
    engineMediator: EngineRealmMediator
  ): Realm;

  [junctureSymbols.createCursor](realm: Realm): Cursor<this>;

  [junctureSymbols.createXpCursor](realm: Realm): Cursor<this>;

  // Currently a DetachedCursor is always eXPosed becase no code runs when a Realm is not mounted.
  // In the future, this could change (static descriptors ??)
  [junctureSymbols.createDetachedXpCursor](parent: DetachedCursorParent, key: PathFragment): DetachedCursor;

  readonly schema: Schema<JunctureSchema>;

  readonly 'selector.defaultValue': Selector<ValueOf<this>>;

  readonly 'selector.path': Selector<Path>;

  readonly 'selector.serviceId': Selector<string>;

  readonly 'selector.value': Selector<ValueOf<this>>;

  readonly 'selector.juncture': Selector<Juncture<this>>;
}

export function isDriver(obj: any): obj is Driver {
  if (!obj) {
    return false;
  }
  return obj[junctureSymbols.driver] === true;
}

// ---  Derivations
export type SchemaOf<D extends Driver> = BodyOfSchema<D['schema']>;
export type ValueOf<D extends Driver> = BodyOfSchema<D['schema']>['defaultValue'];

// Use inference to keep type name
export type CursorOf<D extends Driver> = D extends {
  [junctureSymbols.createCursor](...args : any) : infer C
} ? C : never;
