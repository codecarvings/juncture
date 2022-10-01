/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Engine } from '../../engine';
import { BIT } from '../../lib/bit';
import { LIST, ListValue } from '../../lib/list';
import { STRUCT } from '../../lib/struct';
import { Private } from '../../private-juncture';

test('tmp test', () => {
  class Person extends STRUCT.of({
    name: BIT.settable.string,
    age: BIT.settable.number
  }) { }

  class App extends STRUCT.of({
    list: LIST.of(Person)
  }) {
    'reactor.setListValue' = this.FORGE.reactor(
      () => (value: ListValue<typeof Person>) => ({
        list: value
      })
    );
  }

  const engine = new Engine();
  engine.mountBranch({ juncture: App });
  const { _, select, dispatch } = engine.createFrame({
    app: App
  });

  expect(select(_.app.list).length).toBe(0);
  dispatch(_.app).setListValue([{
    name: 'sergio',
    age: 47
  }]);
  expect(select(_.app.list).length).toBe(1);
  expect(select(_.app.list.item(0).age).value).toBe(47);

  engine.stop();
});

test('tmp test 2', () => {
  class Person extends STRUCT.of({
    name: BIT.settable.string,
    age: BIT.settable.number
  }) { }

  class App extends STRUCT.of({
    list: class extends LIST.of(Private(Person)) {
      'selector.firstName' = this.FORGE.selector(
        ({ value, _ }) => value(_.item(0).name)
      );
    }
  }) {
    'reactor.setListValue' = this.FORGE.reactor(
      () => (value: ListValue<typeof Person>) => ({
        list: value
      })
    );
  }

  const engine = new Engine();
  engine.mountBranch({ juncture: App });
  const { _, select, dispatch } = engine.createFrame({
    app: App
  });

  expect(select(_.app.list).length).toBe(0);

  dispatch(_.app).setListValue([{
    name: 'sergio',
    age: 47
  }]);
  expect(select(_.app.list).length).toBe(1);
  expect(select(_.app.list).firstName).toBe('sergio');

  engine.stop();
});
