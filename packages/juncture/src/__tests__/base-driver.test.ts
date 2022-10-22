/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { AccessModifier } from '../access-modifier';
import { BaseDriver } from '../base-driver';
import { isDescriptor } from '../design/descriptor';
import { DescriptorType } from '../design/descriptor-type';
import { createSchema } from '../design/descriptors/schema';
import { EngineRealmMediator } from '../engine';
import { Juncture } from '../juncture';
import { junctureSymbols } from '../juncture-symbols';
import { Realm, RealmLayout, RealmMediator } from '../operation/realm';
import { getRealm, isRealmHost } from '../operation/realm-host';
import { JunctureSchema } from '../schema';
import { PropertyAssembler } from '../utilities/property-assembler';

describe('BaseDriver', () => {
  class MyDriver extends BaseDriver {
    schema = createSchema(() => new JunctureSchema('dv'));
  }
  let driver: MyDriver;
  beforeEach(() => {
    driver = Juncture.getDriver(MyDriver);
  });

  test('should be a class instantiable without arguments', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const driver = new MyDriver();
    }).not.toThrow();
  });

  describe('[jSymbols.createPropertyAssembler] property', () => {
    test('should be a method', () => {
      expect(typeof driver[junctureSymbols.createPropertyAssembler]).toBe('function');
    });

    test('should create new PropetyAssembler for the instance', () => {
      const assembler = driver[junctureSymbols.createPropertyAssembler]();
      expect((assembler as any).container).toBe(driver);
    });
  });

  describe('[jSymbols.init] property', () => {
    test('should be a method', () => {
      expect(typeof driver[junctureSymbols.init]).toBe('function');
    });

    test('should invoke the wire method of the property assembler', () => {
      class MyDriver2 extends MyDriver {
        [junctureSymbols.createPropertyAssembler]() {
          const assembler = super[junctureSymbols.createPropertyAssembler]();
          const fn = jest.fn((assembler.wire));
          (assembler as any).wire = fn;
          return assembler;
        }
      }

      const driver2 = new MyDriver2();
      const fn = PropertyAssembler.get(driver2).wire as jest.Mock<void, []>;
      const prevInvokcations = fn.mock.calls.length;
      driver2[junctureSymbols.init]();
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
        releaseRequirement: () => { }
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
      expect(typeof driver[junctureSymbols.createRealm]).toBe('function');
    });

    test('should create a new Realm for the provided driver, layout and mediators', () => {
      const realm = driver[junctureSymbols.createRealm](layout, realmMediator, engineMediator);
      expect(realm).toBeInstanceOf(Realm);
      expect(realm.driver).toBe(driver);
      expect(realm.layout).toBe(layout);
    });

    test('should always return a new Realm', () => {
      const realm1 = driver[junctureSymbols.createRealm](layout, realmMediator, engineMediator);
      const realm2 = driver[junctureSymbols.createRealm](layout, realmMediator, engineMediator);
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
        releaseRequirement: () => { }
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
      expect(typeof driver[junctureSymbols.createCursor]).toBe('function');
    });

    test('should return the exposed Cursor of the Realm', () => {
      const realm = driver[junctureSymbols.createRealm](layout, realmMediator, engineMediator);
      const cursor = driver[junctureSymbols.createCursor](realm);
      expect(cursor).toBe(realm.xpCursor);
    });
  });

  describe('[jSymbols.createXpCursor] property', () => {
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
        releaseRequirement: () => { }
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
      expect(typeof driver[junctureSymbols.createXpCursor]).toBe('function');
    });

    test('should create a new Cursor for the provided Realm', () => {
      const realm = driver[junctureSymbols.createRealm](layout, realmMediator, engineMediator);
      const cursor = driver[junctureSymbols.createXpCursor](realm);
      expect(isRealmHost(cursor)).toBe(true);
      expect(getRealm(cursor)).toBe(realm);
    });

    test('should always return a new Cursor', () => {
      const realm = driver[junctureSymbols.createRealm](layout, realmMediator, engineMediator);
      const cursor1 = driver[junctureSymbols.createXpCursor](realm);
      const cursor2 = driver[junctureSymbols.createXpCursor](realm);
      expect(cursor2).not.toBe(cursor1);
    });
  });

  test('should contain the "schema" Schema', () => {
    expect(isDescriptor(driver.schema)).toBe(true);
    expect(driver.schema.type).toBe(DescriptorType.schema);
    expect(driver.schema.access).toBe(AccessModifier.public);
  });

  test('should contain a "defaultValue" PubSelector', () => {
    const desc = driver['selector.defaultValue'];
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.selector);
    expect(desc.access).toBe(AccessModifier.public);
  });

  test('should contain a "path" PubSelector', () => {
    const desc = driver['selector.path'];
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.selector);
    expect(desc.access).toBe(AccessModifier.public);
  });

  test('should contain a "isMounted" PubSelector', () => {
    const desc = driver['selector.isMounted'];
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.selector);
    expect(desc.access).toBe(AccessModifier.public);
  });

  test('should contain a "value" Selector', () => {
    const desc = driver['selector.value'];
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.selector);
    expect(desc.access).toBe(AccessModifier.public);
  });
});
