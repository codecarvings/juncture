/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { Private } from '../../access';
import { JunctureSchema } from '../../design/schema';
import { Engine } from '../../engine';
import { JunctureMap } from '../../juncture';
import { $Bit } from '../../lib/bit';
import {
  $Struct, PartialStructValue, StructRealm, StructSchema
} from '../../lib/struct';
import { Realm } from '../../operation/realm';

// Exposes constructor as public
export class TestStructSchema<JM extends JunctureMap> extends StructSchema<JM> {
  constructor(readonly Children: JM, defaultValue?: PartialStructValue<JM>) {
    super(Children, defaultValue);
  }
}

describe('StructSchema', () => {
  test('should be a subclass of Schema', () => {
    expect(StructSchema.prototype).toBeInstanceOf(JunctureSchema);
  });

  describe('constructor', () => {
    test('should be able to accept a Child map only', () => {
      const schema = new TestStructSchema({ firstName: $Bit.String });
      expect(schema).toBeInstanceOf(StructSchema);
    });

    describe('when passing a custom defaultValue as second, optional, parameter', () => {
      const Children = {
        firstName: $Bit.Of('fn'),
        lastName: $Bit.Of('ln')
      };

      test('should use the provieded defaultValue', () => {
        expect((new TestStructSchema(Children, {
          firstName: 'customFn',
          lastName: 'customLn'
        })).defaultValue).toEqual({
          firstName: 'customFn',
          lastName: 'customLn'
        });
      });

      test('should be able to use the defaultValue of child Junctures when one or more properties is missing', () => {
        expect((new TestStructSchema(Children, {})).defaultValue).toEqual({
          firstName: 'fn',
          lastName: 'ln'
        });

        expect((new TestStructSchema(Children, {
          lastName: 'customLn'
        })).defaultValue).toEqual({
          firstName: 'fn',
          lastName: 'customLn'
        });
      });
    });
  });

  describe('instance', () => {
    test('should have a "Children" property containing the same value passed to the constructor', () => {
      const Children = {
        firstName: $Bit.String
      };
      const schema = new TestStructSchema(Children);
      expect(schema.Children).toBe(Children);
    });

    test('should have a "childKeys" property containing the keys of the Children map', () => {
      const Children = {
        firstName: $Bit.String,
        lastName: $Bit.Number
      };
      const schema = new TestStructSchema(Children);
      expect(schema.childKeys).toEqual(Object.keys(Children));
    });
  });
});

describe('StructRealm', () => {
  test('should be a subclass of Realm', () => {
    expect(StructRealm.prototype).toBeInstanceOf(Realm);
  });
});

test('temp test', () => {
  class Person extends $Struct.Of({
    firstName: $Bit.String,
    lastName: $Bit.String,
    age: $Bit.Of(1)
  }) { }

  class Person2 extends $Struct.Of({
    firstName: Private($Bit.String),
    lastName: Private($Bit.String),
    age: $Bit.Of(1)
  }) {
    fullName = this.FORGE.selector(({ value, _ }) => `${value(_.firstName)} ${value(_.lastName)}`);
  }

  class Parents extends $Struct.Of({
    father: Person,
    mother: Person2
  }) {
    totAge = this.FORGE.selector(({ value, _ }) => value(_.father.age) + value(_.mother.age));

    motherAge = this.FORGE.selector(({ value, _ }) => value(_.mother.age));
  }

  const engine = new Engine(Parents);
  const { _, select } = engine.frame;
  expect(select(_).totAge).toBe(2);
  expect(select(_).totAge).toBe(2);
});
