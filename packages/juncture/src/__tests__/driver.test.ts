/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { AccessModifier } from '../access';
import { isDescriptor } from '../design/descriptor';
import { DescriptorType } from '../design/descriptor-type';
import { createSchema } from '../design/descriptors/schema';
import { JunctureSchema } from '../design/schema';
import { Driver } from '../driver';
import { EngineRealmMediator } from '../engine';
import { Juncture } from '../juncture';
import { Realm, RealmLayout, RealmMediator } from '../operation/realm';
import { getRealm, isRealmHost } from '../operation/realm-host';
import { jSymbols } from '../symbols';
import { PropertyAssembler } from '../tool/property-assembler';

describe('Driver', () => {
  class MyDriver extends Driver {
    schema = createSchema(() => new JunctureSchema('dv'));
  }
  let driver: MyDriver;
  beforeEach(() => {
    driver = Juncture.getDriver(MyDriver);
  });

  test('should be a class instantiable without arguments', () => {
    const driver = new MyDriver();
    expect(driver).toBeInstanceOf(Driver);
  });

  describe('[jSymbols.createPropertyAssembler] property', () => {
    test('should be a method', () => {
      expect(typeof driver[jSymbols.createPropertyAssembler]).toBe('function');
    });

    test('should create new PropetyAssembler for the instance', () => {
      const assembler = driver[jSymbols.createPropertyAssembler]();
      expect((assembler as any).container).toBe(driver);
    });
  });

  describe('[jSymbols.init] property', () => {
    test('should be a method', () => {
      expect(typeof driver[jSymbols.init]).toBe('function');
    });

    test('should invoke the wire method of the property assembler', () => {
      class MyDriver2 extends MyDriver {
        [jSymbols.createPropertyAssembler]() {
          const assembler = super[jSymbols.createPropertyAssembler]();
          const fn = jest.fn((assembler.wire));
          (assembler as any).wire = fn;
          return assembler;
        }
      }

      const driver2 = new MyDriver2();
      const fn = PropertyAssembler.get(driver2).wire as jest.Mock<void, []>;
      const prevInvokcations = fn.mock.calls.length;
      driver2[jSymbols.init]();
      expect(fn).toHaveBeenCalledTimes(prevInvokcations + 1);
    });
  });

  describe('[jSymbols.createRealm] property', () => {
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

    test('should be a method', () => {
      expect(typeof driver[jSymbols.createRealm]).toBe('function');
    });

    test('should create a new Realm for the provided driver, layout and mediators', () => {
      const realm = driver[jSymbols.createRealm](layout, realmMediator, engineMediator);
      expect(realm).toBeInstanceOf(Realm);
      expect(realm.driver).toBe(driver);
      expect(realm.layout).toBe(layout);
    });

    test('should always return a new Realm', () => {
      const realm1 = driver[jSymbols.createRealm](layout, realmMediator, engineMediator);
      const realm2 = driver[jSymbols.createRealm](layout, realmMediator, engineMediator);
      expect(realm2).not.toBe(realm1);
    });
  });

  describe('[jSymbols.createCursor] property', () => {
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

    test('should be a method', () => {
      expect(typeof driver[jSymbols.createCursor]).toBe('function');
    });

    test('should return the outer Cursor of the Realm', () => {
      const realm = driver[jSymbols.createRealm](layout, realmMediator, engineMediator);
      const cursor = driver[jSymbols.createCursor](realm);
      expect(cursor).toBe(realm.outerCursor);
    });
  });

  describe('[jSymbols.createOuterCursor] property', () => {
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

    test('should be a method', () => {
      expect(typeof driver[jSymbols.createOuterCursor]).toBe('function');
    });

    test('should create a new Cursor for the provided Realm', () => {
      const realm = driver[jSymbols.createRealm](layout, realmMediator, engineMediator);
      const cursor = driver[jSymbols.createOuterCursor](realm);
      expect(isRealmHost(cursor)).toBe(true);
      expect(getRealm(cursor)).toBe(realm);
    });

    test('should always return a new Cursor', () => {
      const realm = driver[jSymbols.createRealm](layout, realmMediator, engineMediator);
      const cursor1 = driver[jSymbols.createOuterCursor](realm);
      const cursor2 = driver[jSymbols.createOuterCursor](realm);
      expect(cursor2).not.toBe(cursor1);
    });
  });

  test('should contain the "schema" Schema', () => {
    expect(isDescriptor(driver.schema)).toBe(true);
    expect(driver.schema.type).toBe(DescriptorType.schema);
    expect(driver.schema.access).toBe(AccessModifier.public);
  });

  test('should contain a "defaultValue" PubSelector', () => {
    expect(isDescriptor(driver.defaultValue)).toBe(true);
    expect(driver.defaultValue.type).toBe(DescriptorType.selector);
    expect(driver.defaultValue.access).toBe(AccessModifier.public);
  });

  test('should contain a "path" PubSelector', () => {
    expect(isDescriptor(driver.path)).toBe(true);
    expect(driver.path.type).toBe(DescriptorType.selector);
    expect(driver.path.access).toBe(AccessModifier.public);
  });

  test('should contain a "isMounted" PubSelector', () => {
    expect(isDescriptor(driver.isMounted)).toBe(true);
    expect(driver.isMounted.type).toBe(DescriptorType.selector);
    expect(driver.isMounted.access).toBe(AccessModifier.public);
  });

  test('should contain a "value" Selector', () => {
    expect(isDescriptor(driver.value)).toBe(true);
    expect(driver.value.type).toBe(DescriptorType.selector);
    expect(driver.value.access).toBe(AccessModifier.public);
  });
});
