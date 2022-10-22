/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Engine } from '../../engine';
import { BIT } from '../../lib/bit';
import { FACADE } from '../../lib/facade';
import { STRUCT } from '../../lib/struct';

test('tmp test', () => {
  class Person extends STRUCT.of({
    name: BIT.settable.string,
    age: BIT.settable.number
  }) { }

  class SecretPerson extends FACADE.of(Person) {
    'selector.data' = this.FORGE.selector(
      ({ select, _ }) => `${select(_.inner.name).value} ${select(_.inner).value.age}`
    );
  }

  class Group extends STRUCT.of({
    p1: Person,
    p2: SecretPerson
  }) { }

  const engine = new Engine();
  engine.startService({ juncture: Group });
  const { _, select } = engine.createFrame({
    group: Group
  });

  expect(select(_.group.p1.name).value).toBe('');
  expect(select(_.group.p2).data).toBe(' 0');
  expect(select(_.group.p2).value).toEqual({ name: '', age: 0 });

  engine.stop();
});
