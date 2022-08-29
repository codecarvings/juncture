/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchema } from '../../design/descriptors/schema';
import { JunctureSchema } from '../../design/schema';
import { Driver } from '../../driver';
import { EngineRealmMediator } from '../../engine';
import { Juncture } from '../../juncture';
import { Realm, RealmLayout, RealmMediator } from '../../operation/realm';
import { getRealm, isRealmHost } from '../../operation/realm-host';
import { createRealmRef } from '../../operation/realm-ref';

class MyDriver extends Driver {
  schema = createSchema(() => new JunctureSchema(''));
}
const driver = Juncture.getDriver(MyDriver);
const layout: RealmLayout = {
  parent: null,
  path: [],
  isDivergent: false,
  isUnivocal: true
};
const realmMediator: RealmMediator = {
  getValue: () => undefined,
  setValue: () => { }
};
const engineMediator: EngineRealmMediator = {
  realm: {
    enroll: () => { },
    createControlled: () => undefined!
  },
  action: {
    dispatch: () => { }
  },
  transaction: {
    registerAlteredRealm: () => { }
  }

};

const realm1 = new Realm(driver, layout, realmMediator, engineMediator);
const realm2 = new Realm(driver, layout, realmMediator, engineMediator);

describe('createRealmRef', () => {
  test('should create a RealmRef by passing a Realm', () => {
    const ref = createRealmRef(realm1);
    expect(isRealmHost(ref)).toBe(true);
  });

  test('should create a RealmRef associated with the original Realm', () => {
    const ref = createRealmRef(realm1);

    expect(isRealmHost(ref)).toBe(true);
    expect(getRealm(ref)).toBe(realm1);
    expect(getRealm(ref)).not.toBe(realm2);
  });
});
