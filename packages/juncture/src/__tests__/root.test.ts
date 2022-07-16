/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchemaDef, Schema } from '../definition/schema';
import { Juncture } from '../juncture';
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

  test('should be instantiable by passing a Juncture Type and a custom initial state', () => {
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

    describe('"state" property', () => {
      describe('when the instance has been create', () => {
        test('should contain the defaultValue of the Juncture if no other value is passed in the constructor', () => {
          expect(root.state).toBe(myDefaultValue);
        });
        test('should contain the state passed in the constructor', () => {
          const initialState = { myValue: 'custom' };
          const root2 = new Root(MyJuncture, initialState);
          expect(root2.state).toBe(initialState);
        });
      });
    });
  });
});
