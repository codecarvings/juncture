/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Private } from '../../access';
import { Engine } from '../../engine';
import { $Bit } from '../../lib/bit';
import { $List, ListValue } from '../../lib/list';
import { $Struct } from '../../lib/struct';

test('tmp test', () => {
  class Person extends $Struct.Of({
    name: $Bit.settable.String,
    age: $Bit.settable.Number
  }) { }

  class App extends $Struct.Of({
    list: $List.Of(Person)
  }) {
    setListValue = this.FORGE.reactor(() => (value: ListValue<typeof Person>) => ({
      list: value
    }));
  }

  const engine = new Engine(App);
  const { _, select, dispatch } = engine.frame;

  expect(select(_.list).length).toBe(0);
  dispatch().setListValue([{
    name: 'sergio',
    age: 47
  }]);
  expect(select(_.list).length).toBe(1);
  expect(select(_.list.item(0).age).value).toBe(47);

  engine.stop();
});

test('tmp test 2', () => {
  class Person extends $Struct.Of({
    name: $Bit.settable.String,
    age: $Bit.settable.Number
  }) { }

  class App extends $Struct.Of({
    list: class extends $List.Of(Private(Person)) {
      firstName = this.FORGE.selector(({ value, _ }) => value(_.item(0).name));
    }
  }) {
    setListValue = this.FORGE.reactor(() => (value: ListValue<typeof Person>) => ({
      list: value
    }));
  }

  const engine = new Engine(App);
  const { _, select, dispatch } = engine.frame;

  expect(select(_.list).length).toBe(0);

  dispatch().setListValue([{
    name: 'sergio',
    age: 47
  }]);
  expect(select(_.list).length).toBe(1);
  expect(select(_.list).firstName).toBe('sergio');

  engine.stop();
});
