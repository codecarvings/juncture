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
import { Engine } from '../engine';
import { JunctureMap } from '../juncture';
import { $Bit } from '../lib/bit';
import { $Struct, PartialStructValue, StructSchema } from '../lib/struct';

const myDefaultValue = { myValue: '' };
class MyDriver extends Driver {
  schema = createSchema(() => new JunctureSchema(myDefaultValue));
}

describe('Engine', () => {
  test('should be instantiable by passing only a Juncture', () => {
    const engine = new Engine(MyDriver);
    expect(typeof engine).toBe('object');
  });

  test('should be instantiable by passing a Juncture and a custom initial value', () => {
    const initialValue = { myValue: 'custom' };
    const engine = new Engine(MyDriver, initialValue);
    expect(typeof engine).toBe('object');
  });

  describe('instance', () => {
    let engine: Engine<typeof MyDriver>;
    beforeEach(() => {
      engine = new Engine(MyDriver);
    });

    test('should contain a "Juncture" property that returns the Juncture passed in the constructor', () => {
      expect(engine.Juncture).toBe(MyDriver);
    });

    describe('"value" property', () => {
      describe('when the instance has been create', () => {
        test('should contain the defaultValue of the Juncture if no other value is passed in the constructor', () => {
          expect(engine.value).toBe(myDefaultValue);
        });
        test('should contain the value passed in the constructor', () => {
          const initialValue = { myValue: 'custom' };
          const app2 = new Engine(MyDriver, initialValue);
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
  const engine = new Engine(J1);
  const { _, select } = engine.frame;
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

    set = this.FORGE.reactor(() => (value: ValueOf<this>) => value);

    synthSet = this.FORGE.synthReactor(({ apply }) => (value: ValueOf<this>) => apply().set(value));

    privateSet = this.FORGE.private.reactor(() => () => undefined!);

    r1 = this.FORGE.behavior(({ dispatch, _, trigger }) => {
      const id = setInterval(() => {
        dispatch(_.age).inc();
      }, 1000);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const x = trigger(_.age).value;
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
  const engine = new Engine(J1, {
    name: 'Mirco',
    age: 47,
    ageChanges: 0
  });
  const { _, select, dispatch } = engine.frame;

  let stop = engine.startVirtualSelectorOC();
  expect(select(_).displayName).toBe('Mirco 47');
  let paths = stop();

  expect(select(_).value).toEqual({
    name: 'Mirco',
    age: 47,
    ageChanges: 0
  });

  stop = engine.startVirtualSelectorOC();
  expect(select(_.name).value).toBe('Mirco');
  paths = stop();

  stop = engine.startVirtualSelectorOC();
  expect(select(_.name).value).toBe('Mirco');
  expect(select(_.age).value).toBe(47);
  // expect(select(_).value).toBeTruthy();
  paths = stop();
  // console.dir(paths);

  expect(select(_.age).value).toBe(47);
  dispatch(_.age).set(1001);
  expect(select(_.age).value).toBe(1001);

  expect(engine.value).toEqual({
    name: 'Mirco',
    age: 1001,
    ageChanges: 0
  });
  dispatch(_).set({
    name: 'Mario',
    age: 76,
    ageChanges: 0
  });
  expect(select(_.age).value).toBe(76);
  dispatch(_).synthSet({
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

  engine.stop();
  jest.useRealTimers();
});

test('experiment with frames 2', () => {
  class J1 extends $Struct.Of({
    name: $Bit.Of('Sergio'),
    age: $Bit.settable.Of(46)
  }) {
    displayName = this.FORGE.selector(({ select, _ }) => `${select(_.name).value} ${select(_.age).value.toString()}`);

    pSel = this.FORGE.paramSelector(() => (val: number) => val);

    set = this.FORGE.synthReactor(({ set, _ }) => (name: string, age: number) => [
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

  const engine = new Engine(J2);
  const { _, select, dispatch } = engine.frame;
  expect(select(_).fullValue.height).toBe(183);

  dispatch().set('Mario', 7);
  expect(select(_.age).value).toBe(7);
  expect(select(_.height).value).toBe(183);

  engine.stop();
});
