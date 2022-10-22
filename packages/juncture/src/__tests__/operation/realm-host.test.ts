/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseDriver } from '../../base-driver';
import { createSchema } from '../../design/descriptors/schema';
import { EngineRealmMediator } from '../../engine';
import { Juncture } from '../../juncture';
import { junctureSymbols } from '../../juncture-symbols';
import { Realm, RealmLayout, RealmMediator } from '../../operation/realm';
import { addRealmLink, getRealm, isRealmHost } from '../../operation/realm-host';
import { JunctureSchema } from '../../schema';

class MyDriver extends BaseDriver {
  schema = createSchema(() => new JunctureSchema(''));
}
const driver = Juncture.getDriver(MyDriver);
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
    registerValueApplication: () => { }
  },
  reaction: {
    dispatch: () => { },
    registerAlteredRealm: () => { }
  }
};

const realm1 = new Realm(driver, layout, realmMediator, engineMediator);
const realm2 = new Realm(driver, layout, realmMediator, engineMediator);

describe('addRealmLink', () => {
  test('should add a property [jSymbols.realm] containing a refernce to the provided Realm', () => {
    const host: any = {};
    addRealmLink(host, realm1);
    expect(host[junctureSymbols.realm]).toBe(realm1);
  });

  test('should return the provided container', () => {
    const host = {};
    const host2 = addRealmLink(host, realm1);
    expect(host2).toBe(host);
  });
});

describe('getRealm', () => {
  test('should return the Realm associated to the RealmHost', () => {
    const host1 = addRealmLink({}, realm1);
    const host2 = addRealmLink({}, realm2);

    expect(getRealm(host1)).toBe(realm1);
    expect(getRealm(host2)).toBe(realm2);
  });
});

describe('isRealmHost', () => {
  test('should return true if object is a RealmHost', () => {
    const host = addRealmLink({}, realm1);
    expect(isRealmHost(host)).toBe(true);
  });
  test('should return false if object is not a RealmHost', () => {
    expect(isRealmHost('a-string')).toBe(false);
    expect(isRealmHost(1)).toBe(false);
    expect(isRealmHost(true)).toBe(false);
    expect(isRealmHost(undefined)).toBe(false);
    expect(isRealmHost(null)).toBe(false);
  });
});
