/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchema } from '../../../design/descriptors/schema';
import { JunctureSchema } from '../../../design/schema';
import { Driver } from '../../../driver';
import { EngineRealmMediator } from '../../../engine';
import { Juncture } from '../../../juncture';
import { createCursor } from '../../../operation/frame-equipment/cursor';
import { Realm, RealmLayout, RealmMediator } from '../../../operation/realm';
import { getRealm, isRealmHost } from '../../../operation/realm-host';

class MyDriver extends Driver {
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
  realm: {
    getPersistentPath: () => undefined!,
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

const realm1 = new Realm(driver, layout, realmMediator, engineMediator);
const realm2 = new Realm(driver, layout, realmMediator, engineMediator);

describe('createCursor', () => {
  test('should create a cursor by passing a Realm', () => {
    const cursor = createCursor(realm1);
    expect(isRealmHost(cursor)).toBe(true);
  });

  test('should create a cursor associated with the original Realm', () => {
    const cursor = createCursor(realm1);

    expect(isRealmHost(cursor)).toBe(true);
    expect(getRealm(cursor)).toBe(realm1);
    expect(getRealm(cursor)).not.toBe(realm2);
  });
});
