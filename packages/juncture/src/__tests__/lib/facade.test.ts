/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { JMachine } from '../../j-machine';
import { $Bit } from '../../lib/bit';
import { $Facade } from '../../lib/facade';
import { $Struct } from '../../lib/struct';

test('tmp test', () => {
  class Person extends $Struct.Of({
    name: $Bit.settable.String,
    age: $Bit.settable.Number
  }) { }

  class SecretPerson extends $Facade.Of(Person) {
    data = this.FORGE.selector(({ select, _ }) => `${select(_.inner.name).value} ${select(_.inner).value.age}`);
  }

  class Group extends $Struct.Of({
    p1: Person,
    p2: SecretPerson
  }) { }

  const machine = new JMachine(Group);
  const { _, select } = machine.frame;

  expect(select(_.p1.name).value).toBe('');
  expect(select(_.p2).data).toBe(' 0');
  expect(select(_.p2).value).toEqual({ name: '', age: 0 });
});
