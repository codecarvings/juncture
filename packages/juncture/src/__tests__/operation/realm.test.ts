/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseDriver } from '../../base-driver';
import { createSchema, Schema } from '../../design/descriptors/schema';
import { Driver } from '../../driver';
import { EngineRealmMediator } from '../../engine';
import { RealmManager } from '../../engine-parts/realm-manager';
import { Juncture } from '../../juncture';
import { junctureSymbols } from '../../juncture-symbols';
import {
  Realm, RealmLayout, RealmMediator, RealmMountStatus
} from '../../operation/realm';
import { getRealm, isRealmHost } from '../../operation/realm-host';
import { JunctureSchema } from '../../schema';

describe('Realm', () => {
  interface MyDriver extends Driver {
    schema: Schema<JunctureSchema<string>>;
  }
  let MyMod: Juncture<MyDriver>;
  let driver: MyDriver;

  beforeEach(() => {
    MyMod = class extends BaseDriver {
      schema = createSchema(() => new JunctureSchema(''));
    };
    driver = Juncture.getDriver(MyMod);
  });

  describe('constructor', () => {
    test('should accept a driver, a RealmLayout, a RealmMediator and a EngineRealmMediator', () => {
      const layout: RealmLayout = {
        path: [] as any,
        parent: null,
        isDivergent: false,
        isUnivocal: true
      };
      const realmMediator: RealmMediator = {
        getValue: () => undefined,
        setValue: () => { }
      };
      const engineMediator: EngineRealmMediator = {
        persistentPath: {
          get: () => undefined!,
          release: () => { }
        },
        realm: {
          enroll: () => { },
          createControlled: () => undefined!
        },
        selection: {
          registerValueUsage: () => { }
        },
        reaction: {
          dispatch: () => { },
          registerAlteredRealm: () => { }
        }
      };

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const realm = new Realm(driver, layout, realmMediator, engineMediator);
      }).not.toThrow();
    });
  });

  describe('instance', () => {
    let realmManager: RealmManager;
    let layout: RealmLayout;
    let realmMediator: RealmMediator;
    let engineMediator: EngineRealmMediator;
    let realm: Realm;

    beforeEach(() => {
      realmManager = new RealmManager();
      layout = {
        path: [] as any,
        parent: null,
        isDivergent: false,
        isUnivocal: true
      };
      realmMediator = {
        getValue: () => 1,
        setValue: () => { }
      };
      engineMediator = {
        persistentPath: {
          get: () => undefined!,
          release: () => { }
        },
        realm: {
          enroll: realmManager.enroll,
          createControlled: () => undefined!
        },
        selection: {
          registerValueUsage: () => { }
        },
        reaction: {
          dispatch: () => { },
          registerAlteredRealm: () => { }
        }
      };

      realm = Juncture.createRealm(MyMod, layout, realmMediator, engineMediator);
    });

    test('should have a "driver" property containing a reference to the original Driver', () => {
      expect(realm.driver).toBe(driver);
    });

    test('should have a "layout" property containing the same value of the provided layout', () => {
      expect(realm.layout).toBe(layout);
    });

    test('should have a "mountStatus" initially set to "pending"', () => {
      expect(realm.mountStatus).toBe(RealmMountStatus.pending);
    });

    describe('xpCursor property', () => {
      test('should give access to a exposed cursor associated with the Realm', () => {
        expect(isRealmHost(realm.xpCursor)).toBe(true);
        expect(getRealm(realm.xpCursor)).toBe(realm);
      });

      test('should invoke the driver[jSymbols.createXpCursor] factory only once the first time is accessed', () => {
        (driver as any)[junctureSymbols.createXpCursor] = jest.fn(driver[junctureSymbols.createXpCursor]);
        expect(driver[junctureSymbols.createXpCursor]).toBeCalledTimes(0);
        expect(isRealmHost(realm.xpCursor)).toBe(true);
        expect(getRealm(realm.xpCursor)).toBe(realm);
        expect(driver[junctureSymbols.createXpCursor]).toBeCalledTimes(1);
        expect(isRealmHost(realm.xpCursor)).toBe(true);
        expect(driver[junctureSymbols.createXpCursor]).toBeCalledTimes(1);
      });
    });

    describe('after mount', () => {
      beforeEach(() => {
        realmManager.sync();
      });

      test('should have a "mountStatus" set to "mouted"', () => {
        expect(realm.mountStatus).toBe(RealmMountStatus.mounted);
      });
    });

    describe('after unmount', () => {
      beforeEach(() => {
        realmManager.sync();
        realmManager.dismiss(realm);
        realmManager.sync();
      });

      test('should have property "mountStatus" set to "unmounted"', () => {
        expect(realm.mountStatus).toBe(RealmMountStatus.unmounted);
      });

      test('should throw error if tryng to access the value property', () => {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const val = realm.value;
        }).toThrow();
      });

      test('should throw error if tryng to access the cursor property', () => {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _ = realm.xpCursor;
        }).toThrow();
      });
    });
  });
});