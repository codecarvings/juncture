/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { JMachine } from '../../j-machine';
import { jBit } from '../../lib/bit';
import { jList, ListValue } from '../../lib/list';
import { jStruct } from '../../lib/struct';

test('tmp test', () => {
  class Person extends jStruct.Of({
    name: jBit.settable.String,
    age: jBit.settable.Number
  }) { }

  class App extends jStruct.Of({
    list: jList.Of(Person)
  }) {
    setListValue = this.FORGE.reducer(() => (value: ListValue<typeof Person>) => ({
      list: value
    }));
  }

  const machine = new JMachine(App);
  const { _, select, dispatch } = machine.frame;

  expect(select(_.list).length).toBe(0);
  dispatch().setListValue([{
    name: 'sergio',
    age: 47
  }]);
  expect(select(_.list).length).toBe(1);
  expect(select(_.list.item(0).age).value).toBe(47);

  machine.stop();
});
