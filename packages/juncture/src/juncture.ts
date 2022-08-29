/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from './access';
import {
  CursorOf, Driver, OuterCursorOf, SchemaOf, ValueOf
} from './driver';
import { EngineRealmMediator } from './engine';
import { Realm, RealmLayout, RealmMediator } from './operation/realm';
import { jSymbols } from './symbols';
import { getObjectAttachment } from './tool/object';
import { Singleton } from './tool/singleton';

// #region Symbols
const schemaCacheSymbol = Symbol('schemaCache');
interface JunctureSymbols {
  readonly schemaCache: typeof schemaCacheSymbol;
}
const junctureSymbols: JunctureSymbols = {
  schemaCache: schemaCacheSymbol
};
// #endregion

// #region Juncture
export interface Juncture<D extends Driver = Driver> {
  new(): D;

  access?: AccessModifier;
}

// ---  Derivations
export type SchemaOfJuncture<J extends Juncture> = SchemaOf<InstanceType<J>>;
export type ValueOfJuncture<J extends Juncture> = ValueOf<InstanceType<J>>;

export type CursorOfJuncture<J extends Juncture> = CursorOf<InstanceType<J>>;
export type OuterCursorOfJuncture<J extends Juncture> = OuterCursorOf<InstanceType<J>>;
// #endregion

// #region Additional juncture types

export type AlterableJuncture<D extends Driver = Driver> = new (...args: any) => D;

export type PartialJuncture<D extends Driver = Driver> = abstract new () => D;
export type AlterablePartialJuncture<D extends Driver = Driver> = abstract new (...args: any) => D;

// #endregion

// #region JunctureMap
export interface JunctureMap {
  readonly [key: string]: Juncture;
}

// ---  Derivations
export type CursorMapOfJunctureMap<JM extends JunctureMap> = {
  readonly [K in keyof JM]: OuterCursorOfJuncture<JM[K]>;
};
// #endregion

// #region JunctureSupplier
interface JunctureSupplier {
  getDriver<J extends Juncture>(Juncture: J): InstanceType<J>;

  getSchema<J extends Juncture>(Juncture: J): SchemaOfJuncture<J>;
  getSchema<D extends Driver>(driver: D): SchemaOf<D>;

  createRealm(
    Juncture: Juncture,
    layoyt: RealmLayout,
    realmMediator: RealmMediator,
    engineMediator: EngineRealmMediator
  ): Realm;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Juncture: JunctureSupplier = {
  getDriver<J extends Juncture>(Juncture: J): InstanceType<J> {
    return Singleton.get(Juncture).instance;
  },

  getSchema(driver_or_Juncture: Driver | Juncture) {
    const driver = Singleton.getInstance(driver_or_Juncture) as Driver;
    return getObjectAttachment(driver, junctureSymbols.schemaCache, () => driver.schema[jSymbols.payload]());
  },

  createRealm(
    Juncture: Juncture,
    layoyt: RealmLayout,
    realmMediator: RealmMediator,
    engineMediator: EngineRealmMediator
  ): Realm {
    const driver = Singleton.get(Juncture).instance;
    return driver[jSymbols.createRealm](layoyt, realmMediator, engineMediator);
  }
};
// #endregion
