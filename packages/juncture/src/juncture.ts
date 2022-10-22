/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from './access-modifier';
import { Driver, SchemaOf, ValueOf } from './driver';
import { EngineRealmMediator } from './engine';
import { junctureSymbols } from './juncture-symbols';
import { Realm, RealmLayout, RealmMediator } from './operation/realm';
import { PrivateJunctureAnnex } from './private-juncture';
import { Setup } from './setup';
import { getObjectAttachment } from './utilities/object';
import { Singleton } from './utilities/singleton';

// #region Private Symbols
const schemaSymbol = Symbol('schema');
const setupSymbol = Symbol('setup');
interface PrvSymbols {
  readonly schema: typeof schemaSymbol;
  readonly setup: typeof setupSymbol;
}
const prvSymbols: PrvSymbols = {
  schema: schemaSymbol,
  setup: setupSymbol
};
// #endregion

interface JunctureDecorations {
  readonly [junctureSymbols.juncture]: true;

  readonly access?: AccessModifier;
}

// #region Juncture
export interface Juncture<D extends Driver = Driver> extends JunctureDecorations {
  new(): D;
}

export function isJuncture(obj: any): obj is Juncture {
  if (typeof obj !== 'function') {
    return false;
  }
  if (obj[junctureSymbols.juncture] !== true) {
    return false;
  }

  return true;
}

// ---  Derivations
export type SchemaOfJuncture<J extends Juncture> = SchemaOf<InstanceType<J>>;
export type ValueOfJuncture<J extends Juncture> = ValueOf<InstanceType<J>>;

// export type CursorOfJuncture<J extends Juncture> = CursorOf<InstanceType<J>>;
// export type XpCursorOfDriver<D extends Driver> = D extends {
//   [junctureSymbols.createXpCursor](...args : any) : infer C
// } ? C : never;
// export type XpCursorOf<J extends Juncture> = XpCursorOfDriver<InstanceType<J>>;

// Use inference to keep type name
export type XpCursorOf<J extends Juncture> = InstanceType<J> extends {
  [junctureSymbols.createXpCursor](...args : any) : infer C
} ? C : never;

// #endregion

// #region Additional juncture types
export interface AlterableJuncture<D extends Driver = Driver> extends JunctureDecorations {
  new (...args: any): D
}

export type PartialJuncture<D extends Driver = Driver> = (abstract new () => D) & JunctureDecorations;
export type AlterablePartialJuncture<D extends Driver = Driver> =
(abstract new (...args: any) => D) & JunctureDecorations;
// #endregion

// #region JunctureMap
export interface JunctureMap {
  readonly [key: PropertyKey]: Juncture;
}

// ---  Derivations
export type CursorMapOfJunctureMap<JM extends JunctureMap> = {
  readonly [K in keyof JM]: XpCursorOf<JM[K]>;
};
export type XpCursorMapOfJunctureMap<JM extends JunctureMap> = {
  readonly [K in keyof JM as JM[K] extends PrivateJunctureAnnex ? never : K]: XpCursorOf<JM[K]>;
};
// #endregion

// #region JunctureHelper
interface JunctureHelper {
  getDriver<J extends Juncture>(juncture: J): InstanceType<J>;

  getSchema<J extends Juncture>(juncture: J): SchemaOfJuncture<J>;
  getSchema<D extends Driver>(driver: D): SchemaOf<D>;

  getSetup<J extends Juncture>(juncture: J): Setup;
  getSetup<D extends Driver>(driver: D): Setup;

  createRealm(
    juncture: Juncture,
    layoyt: RealmLayout,
    realmMediator: RealmMediator,
    engineMediator: EngineRealmMediator
  ): Realm;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Juncture: JunctureHelper = {
  getDriver<J extends Juncture>(juncture: J): InstanceType<J> {
    return Singleton.get(juncture).instance;
  },

  getSchema(driver_or_juncture: Driver | Juncture) {
    const driver = Singleton.getInstance(driver_or_juncture) as Driver;
    return getObjectAttachment(driver, prvSymbols.schema, () => driver.schema[junctureSymbols.payload]());
  },

  getSetup(driver_or_juncture: Driver | Juncture) {
    const driver = Singleton.getInstance(driver_or_juncture) as Driver;
    return getObjectAttachment(driver, prvSymbols.setup, () => driver[junctureSymbols.createSetup]());
  },

  createRealm(
    juncture: Juncture,
    layoyt: RealmLayout,
    realmMediator: RealmMediator,
    engineMediator: EngineRealmMediator
  ): Realm {
    const driver = Singleton.get(juncture).instance;
    return driver[junctureSymbols.createRealm](layoyt, realmMediator, engineMediator);
  }
};
// #endregion
