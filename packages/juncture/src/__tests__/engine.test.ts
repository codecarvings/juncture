/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseDriver } from '../base-driver';
import { createSchema } from '../design/descriptors/schema';
import { ValueOf } from '../driver';
import { Engine } from '../engine';
import { JunctureMap } from '../juncture';
import { BIT } from '../lib/bit';
import { PartialStructValue, STRUCT, StructSchema } from '../lib/struct';
import { Instruction } from '../operation/instruction';
import { JunctureSchema } from '../schema';

const myDefaultValue = { myValue: '' };
class MyDriver extends BaseDriver {
  schema = createSchema(() => new JunctureSchema(myDefaultValue));
}

describe('Engine', () => {
  test('should be instantiable withoug passing arguments', () => {
    const engine = new Engine();
    expect(typeof engine).toBe('object');
  });
});

test('experiment with frames', () => {
  class J1 extends STRUCT.of({
    name: BIT.of('Sergio'),
    age: BIT.settable.of(46)
  }) {
    'selector.displayName' = this.FORGE.selector(
      ({ select, _ }) => {
        const result = `${select(_.name).value} ${select(_.age).value.toString()}`;
        return result;
      }
    );
  }
  const engine = new Engine();
  engine.mountBranch({ juncture: J1 });
  const { _, select } = engine.createFrame({
    j1: J1
  });
  expect(select(_.j1).displayName).toBe('Sergio 46');
  expect(select(_.j1).value).toEqual({
    name: 'Sergio',
    age: 46
  });
  expect(select(_.j1.name).value).toBe('Sergio');
  expect(select(_.j1.age).value).toBe(46);
  engine.stop();
});

test('experiment with frames 2', () => {
  class J1 extends STRUCT.of({
    name: BIT.of('Sergio'),
    age: BIT.settable.of(46),
    ageChanges: BIT.settable.number
  }) {
    'selector.displayName' = this.FORGE.selector(
      ({ select, _ }) => `${select(_.name).value} ${select(_.age).value.toString()}`
    );

    'selector.pSel' = this.FORGE.paramSelector(
      () => (str: string) => str.length
    );

    'reactor.set' = this.FORGE.reactor(
      () => (value: ValueOf<this>) => value
    );

    'reactor.synthSet' = this.FORGE.synthReactor(
      ({ apply }) => (value: ValueOf<this>): Instruction => apply().set(value)
    );

    'reactor.privateSet' = this.FORGE.private.reactor(
      () => () => undefined!
    );

    'behavior.1' = this.FORGE.behavior(({ dispatch, _ }) => {
      const id = setInterval(() => {
        dispatch(_.age).inc();
      }, 1000);

      // console.log(x);

      return () => {
        clearInterval(id);
        // sub.unsubscribe();
      };
    });

    'selector.abc' = this.FORGE.private.selector(
      () => 21
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  class J2 extends J1 {
    'selector.ff1' = this.FORGE.selector(
      () => ''
    );

    'selector.abc' = this.FORGE.override(super['selector.abc']).selector(
      () => 33
    );
  }

  jest.useFakeTimers();
  const engine = new Engine();
  engine.mountBranch({
    key: 'primary',
    juncture: J1,
    initialValue: {
      name: 'Mirco',
      age: 47,
      ageChanges: 0
    }
  });
  const { _, select, dispatch } = engine.createFrame({
    j1: J1
  });

  let stop = engine.startSelectorAudit();
  expect(select(_.j1).displayName).toBe('Mirco 47');
  stop();

  expect(select(_.j1).value).toEqual({
    name: 'Mirco',
    age: 47,
    ageChanges: 0
  });

  stop = engine.startSelectorAudit();
  expect(select(_.j1.name).value).toBe('Mirco');
  stop();

  stop = engine.startSelectorAudit();
  expect(select(_.j1.name).value).toBe('Mirco');
  expect(select(_.j1.age).value).toBe(47);
  // expect(select(_).value).toBeTruthy();
  stop().subscribe({
    complete: () => {
      console.log('Selectors must be recomputed');
    }
  });
  // console.dir(paths);

  expect(select(_.j1.age).value).toBe(47);
  dispatch(_.j1.age).set(1001);
  expect(select(_.j1.age).value).toBe(1001);

  expect(engine.state).toEqual({
    primary: {
      name: 'Mirco',
      age: 1001,
      ageChanges: 0
    }
  });
  dispatch(_.j1).set({
    name: 'Mario',
    age: 76,
    ageChanges: 0
  });
  expect(select(_.j1.age).value).toBe(76);
  dispatch(_.j1).synthSet({
    name: 'Mario',
    age: 99,
    ageChanges: 0
  });
  expect(select(_.j1.age).value).toBe(99);
  expect(select(_.j1).juncture).toBe(J1);

  jest.advanceTimersByTime(1200);
  expect(select(_.j1.age).value).toBe(100);

  jest.advanceTimersByTime(3000);
  expect(select(_.j1.age).value).toBe(103);

  engine.stop();
  jest.useRealTimers();
});

test('experiment with frames 2', () => {
  class J1 extends STRUCT.of({
    name: BIT.of('Sergio'),
    age: BIT.settable.of(46)
  }) {
    'selector.displayName' = this.FORGE.selector(
      ({ select, _ }) => `${select(_.name).value} ${select(_.age).value.toString()}`
    );

    'selector.pSel' = this.FORGE.paramSelector(
      () => (val: number) => val
    );

    'reactor.set' = this.FORGE.synthReactor(
      ({ set, _ }) => (name: string, age: number) => [
        set(_.name, name),
        set(_.age, age)
      ]
    );

    'selector.fullValue' = this.FORGE.selector(
      ({ value }) => ({
        ...value(),
        name: value().name,
        age: value().age
      })
    );
  }

  class StructSchema2<JM extends JunctureMap = JunctureMap> extends StructSchema<JM> {
    constructor(readonly children: JM, defaultValue?: PartialStructValue<JM>) {
      super(children, defaultValue);
    }
  }
  class J2 extends J1 {
    schema = createSchema(() => new StructSchema2({
      name: BIT.of('Sergio'),
      age: BIT.settable.of(46),
      height: BIT.settable.of(183)
    }));
  }

  const engine = new Engine();
  engine.mountBranch({ juncture: J2 });
  const { _, select, dispatch } = engine.createFrame({
    j2: J2
  });
  expect(select(_.j2).fullValue.height).toBe(183);

  dispatch(_.j2).set('Mario', 7);
  expect(select(_.j2.age).value).toBe(7);
  expect(select(_.j2.height).value).toBe(183);

  engine.stop();
});
