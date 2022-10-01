/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { Engine } from '../../engine';
import { JunctureMap } from '../../juncture';
import { BIT } from '../../lib/bit';
import { STRUCT, StructPartialValue, StructRealm, StructSchema } from '../../lib/struct';
import { Realm } from '../../operation/realm';
import { Private } from '../../private-juncture';
import { JunctureSchema } from '../../schema';

// Exposes constructor as public
export class TestStructSchema<JM extends JunctureMap> extends StructSchema<JM> {
  constructor(readonly children: JM, defaultValue?: StructPartialValue<JM>) {
    super(children, defaultValue);
  }
}

describe('StructSchema', () => {
  test('should be a subclass of Schema', () => {
    expect(StructSchema.prototype).toBeInstanceOf(JunctureSchema);
  });

  describe('constructor', () => {
    test('should be able to accept a child map only', () => {
      const schema = new TestStructSchema({ firstName: BIT.string });
      expect(schema).toBeInstanceOf(StructSchema);
    });

    describe('when passing a custom defaultValue as second, optional, argument', () => {
      const children = {
        firstName: BIT.of('fn'),
        lastName: BIT.of('ln')
      };

      test('should use the provieded defaultValue', () => {
        expect((new TestStructSchema(children, {
          firstName: 'customFn',
          lastName: 'customLn'
        })).defaultValue).toEqual({
          firstName: 'customFn',
          lastName: 'customLn'
        });
      });

      test('should be able to use the defaultValue of child Junctures when one or more properties is missing', () => {
        expect((new TestStructSchema(children, {})).defaultValue).toEqual({
          firstName: 'fn',
          lastName: 'ln'
        });

        expect((new TestStructSchema(children, {
          lastName: 'customLn'
        })).defaultValue).toEqual({
          firstName: 'fn',
          lastName: 'customLn'
        });
      });
    });
  });

  describe('instance', () => {
    test('should have a "children" property containing the same value passed to the constructor', () => {
      const children = {
        firstName: BIT.string
      };
      const schema = new TestStructSchema(children);
      expect(schema.children).toBe(children);
    });

    test('should have a "childKeys" property containing the keys of the child map', () => {
      const children = {
        firstName: BIT.string,
        lastName: BIT.number
      };
      const schema = new TestStructSchema(children);
      expect(schema.childKeys).toEqual(Object.keys(children));
    });
  });
});

describe('StructRealm', () => {
  test('should be a subclass of Realm', () => {
    expect(StructRealm.prototype).toBeInstanceOf(Realm);
  });
});

test('temp test', () => {
  class Person extends STRUCT.of({
    firstName: BIT.string,
    lastName: BIT.string,
    age: BIT.of(1)
  }) { }

  class Person2 extends STRUCT.of({
    firstName: Private(BIT.string),
    lastName: Private(BIT.string),
    age: BIT.of(1)
  }) {
    'selector.fullName' = this.FORGE.selector(
      ({ value, _ }) => `${value(_.firstName)} ${value(_.lastName)}`
    );
  }

  class Parents extends STRUCT.of({
    father: Person,
    mother: Person2
  }) {
    'selector.totAge' = this.FORGE.selector(
      ({ value, _ }) => value(_.father.age) + value(_.mother.age)
    );

    'selector.motherAge' = this.FORGE.selector(
      ({ value, _ }) => value(_.mother.age)
    );
  }

  const engine = new Engine();
  engine.mountBranch({ juncture: Parents });
  const { _, select } = engine.createFrame({
    parents: Parents
  });
  expect(select(_.parents).totAge).toBe(2);
  expect(select(_.parents).totAge).toBe(2);
  engine.stop();
});
