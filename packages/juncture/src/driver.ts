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
import { Path } from './operation/path';
import {
  Realm, RealmLayout, RealmMediator
} from './operation/realm';
import { JunctureSchema } from './schema';
import { Setup } from './setup';
import { Initializable } from './utilities/initializable';
import { PropertyAssemblerHost } from './utilities/property-assembler';

export interface Driver extends PropertyAssemblerHost, Initializable {
  [junctureSymbols.createSetup](): Setup;

  [junctureSymbols.createRealm](
    layout: RealmLayout,
    realmMediator: RealmMediator,
    engineMediator: EngineRealmMediator
  ): Realm;

  [junctureSymbols.createCursor](realm: Realm): Cursor<this>;

  [junctureSymbols.createXpCursor](realm: Realm): Cursor<this>;

  readonly schema: Schema<JunctureSchema>;

  readonly 'selector.defaultValue': Selector<ValueOf<this>>;

  readonly 'selector.path': Selector<Path>;

  readonly 'selector.branchKey': Selector<string>;

  readonly 'selector.isMounted': Selector<boolean>;

  readonly 'selector.value': Selector<ValueOf<this>>;

  readonly 'selector.juncture': Selector<Juncture<this>>;
}

// ---  Derivations
export type SchemaOf<D extends Driver> = BodyOfSchema<D['schema']>;
export type ValueOf<D extends Driver> = BodyOfSchema<D['schema']>['defaultValue'];

// Use inference to keep type name
export type CursorOf<D extends Driver> = D extends {
  [junctureSymbols.createCursor](...args : any) : infer C
} ? C : never;

export type XpCursorOfDriver<D extends Driver> = D extends {
  [junctureSymbols.createXpCursor](...args : any) : infer C
} ? C : never;
