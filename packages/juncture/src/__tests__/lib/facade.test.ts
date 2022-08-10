/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { JMachine } from '../../j-machine';
import { jBit } from '../../lib/bit';
import { jFacade } from '../../lib/facade';
import { jStruct } from '../../lib/struct';

test('tmp test', () => {
  class Person extends jStruct.Of({
    name: jBit.settable.String,
    age: jBit.settable.Number
  }) { }

  class SecretPerson extends jFacade.Of(Person) {
    data = this.FORGE.selector(({ select, _ }) => `${select(_.inner.name).value} ${select(_.inner).value.age}`);
  }

  class Group extends jStruct.Of({
    p1: Person,
    p2: SecretPerson
  }) { }

  const machine = new JMachine(Group);
  const { _, select } = machine.frame;

  expect(select(_.p1.name).value).toBe('');
  expect(select(_.p2).data).toBe(' 0');
  expect(select(_.p2).value).toEqual({ name: '', age: 0 });
});
