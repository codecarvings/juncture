/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchema } from '../design/descriptors/schema';
import { JunctureSchema } from '../design/schema';
import { Driver, ValueOf } from '../driver';
import { JMachine } from '../j-machine';
import { JunctureMap } from '../juncture';
import { $Bit } from '../lib/bit';
import { $Struct, PartialStructValue, StructSchema } from '../lib/struct';

const myDefaultValue = { myValue: '' };
class MyDriver extends Driver {
  schema = createSchema(() => new JunctureSchema(myDefaultValue));
}

describe('JMachine', () => {
  test('should be instantiable by passing only a Juncture', () => {
    const machine = new JMachine(MyDriver);
    expect(typeof machine).toBe('object');
  });

  test('should be instantiable by passing a Juncture and a custom initial value', () => {
    const initialValue = { myValue: 'custom' };
    const machine = new JMachine(MyDriver, initialValue);
    expect(typeof machine).toBe('object');
  });

  describe('instance', () => {
    let machine: JMachine<typeof MyDriver>;
    beforeEach(() => {
      machine = new JMachine(MyDriver);
    });

    test('should contain a "Juncture" property that returns the Juncture passed in the constructor', () => {
      expect(machine.Juncture).toBe(MyDriver);
    });

    describe('"value" property', () => {
      describe('when the instance has been create', () => {
        test('should contain the defaultValue of the Juncture if no other value is passed in the constructor', () => {
          expect(machine.value).toBe(myDefaultValue);
        });
        test('should contain the value passed in the constructor', () => {
          const initialValue = { myValue: 'custom' };
          const app2 = new JMachine(MyDriver, initialValue);
          expect(app2.value).toBe(initialValue);
        });
      });
    });
  });
});

test('experiment with frames', () => {
  class J1 extends $Struct.Of({
    name: $Bit.Of('Sergio'),
    age: $Bit.settable.Of(46)
  }) {
    displayName = this.FORGE.selector(({ select, _ }) => {
      const result = `${select(_.name).value} ${select(_.age).value.toString()}`;
      return result;
    });
  }
  const machine = new JMachine(J1);
  const { _, select } = machine.frame;
  expect(select(_).displayName).toBe('Sergio 46');
  expect(select(_).value).toEqual({
    name: 'Sergio',
    age: 46
  });
  expect(select(_.name).value).toBe('Sergio');
  expect(select(_.age).value).toBe(46);
});

test('experiment with frames 2', () => {
  class J1 extends $Struct.Of({
    name: $Bit.Of('Sergio'),
    age: $Bit.settable.Of(46),
    ageChanges: $Bit.settable.Number
  }) {
    displayName = this.FORGE.selector(({ select, _ }) => `${select(_.name).value} ${select(_.age).value.toString()}`);

    pSel = this.FORGE.paramSelector(() => (str: string) => str.length);

    set = this.FORGE.reducer(() => (value: ValueOf<this>) => value);

    privateSet = this.FORGE.private.reducer(() => () => undefined!);

    r1 = this.FORGE.reactor(({ dispatch, _, source }) => {
      const id = setInterval(() => {
        dispatch(_.age).inc();
      }, 1000);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const x = source(_.age).value;
      // console.log(x);

      return () => {
        clearInterval(id);
        // sub.unsubscribe();
      };
    });

    abc = this.FORGE.private.selector(() => 21);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  class J2 extends J1 {
    ff1 = this.FORGE.selector(() => '');

    abc = this.FORGE.override(super.abc).selector(() => 33);
  }

  jest.useFakeTimers();
  const machine = new JMachine(J1, {
    name: 'Mirco',
    age: 47,
    ageChanges: 0
  });
  const { _, select, dispatch } = machine.frame;
  expect(select(_).displayName).toBe('Mirco 47');
  expect(select(_).value).toEqual({
    name: 'Mirco',
    age: 47,
    ageChanges: 0
  });
  expect(select(_.name).value).toBe('Mirco');
  expect(select(_.age).value).toBe(47);
  dispatch(_.age).set(1001);
  expect(select(_.age).value).toBe(1001);
  expect(machine.value).toEqual({
    name: 'Mirco',
    age: 1001,
    ageChanges: 0
  });
  dispatch(_).set({
    name: 'Mario',
    age: 99,
    ageChanges: 0
  });
  expect(select(_.age).value).toBe(99);
  expect(select(_).Juncture).toBe(J1);

  jest.advanceTimersByTime(1200);
  expect(select(_.age).value).toBe(100);

  jest.advanceTimersByTime(3000);
  expect(select(_.age).value).toBe(103);

  machine.stop();
  jest.useRealTimers();
});

test('experiment with frames 2', () => {
  class J1 extends $Struct.Of({
    name: $Bit.Of('Sergio'),
    age: $Bit.settable.Of(46)
  }) {
    displayName = this.FORGE.selector(({ select, _ }) => `${select(_.name).value} ${select(_.age).value.toString()}`);

    set = this.FORGE.trigger(({ set, _ }) => (name: string, age: number) => [
      set(_.name, name),
      set(_.age, age)
    ]);

    fullValue = this.FORGE.selector(({ value }) => ({
      ...value(),
      name: value().name,
      age: value().age
    }));
  }

  class StructSchema2<JM extends JunctureMap = any> extends StructSchema<JM> {
    constructor(readonly Children: JM, defaultValue?: PartialStructValue<JM>) {
      super(Children, defaultValue);
    }
  }
  class J2 extends J1 {
    schema = createSchema(() => new StructSchema2({
      name: $Bit.Of('Sergio'),
      age: $Bit.settable.Of(46),
      height: $Bit.settable.Of(183)
    }));
  }

  const machine = new JMachine(J2);
  const { _, select, dispatch } = machine.frame;
  expect(select(_).fullValue.height).toBe(183);
  dispatch().set('Mario', 7);
  expect(select(_.age).value).toBe(7);
  expect(select(_.height).value).toBe(183);
  // const gear = getGear(_);
  // gear.outerCursor;

  machine.stop();
});
