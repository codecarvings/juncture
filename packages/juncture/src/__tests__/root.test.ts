/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchemaDef, Schema } from '../definition/schema';
import { Juncture } from '../juncture';
import { jBit } from '../lib/bit';
import { jGroup } from '../lib/group';
import { Root } from '../root';

const myDefaultValue = { myValue: '' };
class MyJuncture extends Juncture {
  schema = createSchemaDef(() => new Schema(myDefaultValue));
}

describe('Root', () => {
  test('should be instantiable by passing only a Juncture Type', () => {
    const root = new Root(MyJuncture);
    expect(typeof root).toBe('object');
  });

  test('should be instantiable by passing a Juncture Type and a custom initial value', () => {
    const initialState = { myValue: 'custom' };
    const root = new Root(MyJuncture, initialState);
    expect(typeof root).toBe('object');
  });

  describe('instance', () => {
    let root: Root<typeof MyJuncture>;
    beforeEach(() => {
      root = new Root(MyJuncture);
    });

    test('should contain a "Type" property that returns the type passed in the constructor', () => {
      expect(root.Type).toBe(MyJuncture);
    });

    describe('"value" property', () => {
      describe('when the instance has been create', () => {
        test('should contain the defaultValue of the Juncture if no other value is passed in the constructor', () => {
          expect(root.value).toBe(myDefaultValue);
        });
        test('should contain the value passed in the constructor', () => {
          const initialState = { myValue: 'custom' };
          const root2 = new Root(MyJuncture, initialState);
          expect(root2.value).toBe(initialState);
        });
      });
    });
  });
});

test.only('experiment with frames', () => {
  class J1 extends jGroup.of({
    name: jBit.Of('Sergio'),
    age: jBit.Of(46)
  }) {
    displayName = this.DEF.selector(({ select, _ }) => `${select(_.name).value} ${select(_.age).value.toString()}`);
  }
  const root = new Root(J1);
  const { _, select } = root.frame;
  expect(select(_).displayName).toBe('Sergio 46');
  expect(select(_).value).toEqual({
    name: 'Sergio',
    age: 46
  });
  expect(select(_.name).value).toBe('Sergio');
  expect(select(_.age).value).toBe(46);
});
