/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchemaDef, Schema } from '../definition/schema';
import { Driver } from '../driver';
import { Juncture } from '../juncture';

describe('Driver', () => {
  class MyJuncture extends Juncture {
    schema = createSchemaDef(() => new Schema(''));

    mySelector = this.DEF.selector(() => 0);

    myPrivateSelector = this.DEF.private.selector(() => 0);

    myReducer = this.DEF.reducer(() => (value: string) => value);

    myPrivateReducer = this.DEF.private.reducer(() => (value: string) => value);
  }

  class MyJuncture2 extends MyJuncture {
    myParamSelector = this.DEF.paramSelector(() => (value: string) => value);

    myMixReducer = this.DEF.mixReducer(() => () => []);
  }

  let juncture: MyJuncture2;
  beforeEach(() => {
    juncture = Juncture.getInstance(MyJuncture2);
  });

  test('should be a class instantiable by passing a Juncture instance', () => {
    const driver = new Driver(juncture);
    expect(driver).toBeInstanceOf(Driver);
  });

  describe('instance', () => {
    let driver: Driver<MyJuncture2>;
    beforeEach(() => {
      driver = new Driver(juncture);
    });

    test('should have a "juncture" property that refers to the original juncture instance', () => {
      expect(driver.juncture).toBe(juncture);
    });

    test('should have a "schema" property with the schema object', () => {
      expect(driver.schema).toBeInstanceOf(Schema);
    });

    describe('"selector" property', () => {
      test('should have a "keys" property containing all the selector keys', () => {
        expect((driver.selector.keys as string[]).sort())
          .toEqual(['defaultValue', 'path', 'isMounted', 'value',
            'myPrivateSelector', 'mySelector', 'myParamSelector'].sort());
      });

      test('should have a "pubKeys" property containing the key of every selector publicly available', () => {
        expect((driver.selector.pubKeys as string[]).sort())
          .toEqual(['defaultValue', 'path', 'isMounted', 'value', 'mySelector', 'myParamSelector'].sort());
      });

      test('should have a "defs" property containing the map of each declared selector', () => {
        expect(driver.selector.defs.defaultValue).toBe(juncture.defaultValue);
        expect(driver.selector.defs.path).toBe(juncture.path);
        expect(driver.selector.defs.isMounted).toBe(juncture.isMounted);
        expect(driver.selector.defs.value).toBe(juncture.value);
        expect(driver.selector.defs.myPrivateSelector).toBe(juncture.myPrivateSelector);
        expect(driver.selector.defs.mySelector).toBe(juncture.mySelector);
        expect(driver.selector.defs.myParamSelector).toBe(juncture.myParamSelector);
        expect(Object.keys(driver.selector.defs)).toHaveLength(7);
      });
    });

    describe('"reducer" property', () => {
      test('should have a "keys" property containing all the reducer keys', () => {
        expect((driver.reducer.keys as string[]).sort())
          .toEqual(['myPrivateReducer', 'myReducer', 'myMixReducer'].sort());
      });

      test('should have a "pubKeys" property containing the keys of every reducer publicly available', () => {
        expect((driver.reducer.pubKeys as string[]).sort())
          .toEqual(['myReducer', 'myMixReducer'].sort());
      });

      test('should have a "defs" property containing the map of each declared reducer', () => {
        expect(driver.reducer.defs.myReducer).toBe(juncture.myReducer);
        expect(driver.reducer.defs.myPrivateReducer).toBe(juncture.myPrivateReducer);
        expect(driver.reducer.defs.myMixReducer).toBe(juncture.myMixReducer);
        expect(Object.keys(driver.reducer.defs)).toHaveLength(3);
      });
    });
  });
});
