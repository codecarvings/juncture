/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { JunctureSchema } from '../../design/schema';
import { Gear } from '../../engine/gear';
import { JMachine } from '../../j-machine';
import { JunctureCtorMap } from '../../juncture';
import { jBit } from '../../lib/bit';
import {
    jStruct, PartialStructValue, StructGear, StructSchema
} from '../../lib/struct';

// Exposes constructor as public
export class TestStructSchema<JTM extends JunctureCtorMap> extends StructSchema<JTM> {
  constructor(readonly Children: JTM, defaultValue?: PartialStructValue<JTM>) {
    super(Children, defaultValue);
  }
}

describe('StructSchema', () => {
  test('should be a subclass of Schema', () => {
    expect(StructSchema.prototype).toBeInstanceOf(JunctureSchema);
  });

  describe('constructor', () => {
    test('should be able to accept a Child map only', () => {
      const schema = new TestStructSchema({ firstName: jBit.String });
      expect(schema).toBeInstanceOf(StructSchema);
    });

    describe('when passing a custom defaultValue as second, optional, parameter', () => {
      const Children = {
        firstName: jBit.Of('fn'),
        lastName: jBit.Of('ln')
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

      test('should be able to use the defaultValue of child junctures when one or more properties is missing', () => {
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
        firstName: jBit.String
      };
      const schema = new TestStructSchema(Children);
      expect(schema.Children).toBe(Children);
    });

    test('should have a "childKeys" property containing the keys of the Children map', () => {
      const Children = {
        firstName: jBit.String,
        lastName: jBit.Number
      };
      const schema = new TestStructSchema(Children);
      expect(schema.childKeys).toEqual(Object.keys(Children));
    });
  });
});

describe('StructGear', () => {
  test('should be a subclass of Gear', () => {
    expect(StructGear.prototype).toBeInstanceOf(Gear);
  });
});

test('temp test', () => {
  class Person extends jStruct.Of({
    firstName: jBit.String,
    lastName: jBit.String,
    age: jBit.Of(1)
  }) { }

  class Parents extends jStruct.Of({
    father: Person,
    mother: Person
  }) {
    totAge = this.FORGE.selector(({ value, _ }) => value(_.father.age) + value(_.mother.age));
  }

  const machine = new JMachine(Parents);
  expect(machine.frame.select().totAge).toBe(2);
});
