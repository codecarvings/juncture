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
  class MySchema extends Schema<string> {
    constructor() {
      super('');
    }
  }
  class MyJuncture extends Juncture {
    schema = createSchemaDef(() => new MySchema());

    mySelector = this.DEF.selector(() => 0);

    myReducer = this.DEF.reducer(() => (value: string) => value);
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

    test('should have a property "juncture" that refers to the original juncture instance', () => {
      expect(driver.juncture).toBe(juncture);
    });

    test('should have a property "schema" with the schema object', () => {
      expect(driver.schema).toBeInstanceOf(MySchema);
    });

    test('should have a property selector.defs containing the map of each declared selector', () => {
      expect(driver.selector.defs.defaultValue).toBe(juncture.defaultValue);
      expect(driver.selector.defs.path).toBe(juncture.path);
      expect(driver.selector.defs.isMounted).toBe(juncture.isMounted);
      expect(driver.selector.defs.value).toBe(juncture.value);
      expect(driver.selector.defs.mySelector).toBe(juncture.mySelector);
      expect(driver.selector.defs.myParamSelector).toBe(juncture.myParamSelector);
      expect(Object.keys(driver.selector.defs)).toHaveLength(6);
    });

    test('should have a property selector.keys containing the selector keys', () => {
      expect((driver.selector.keys as string[]).sort())
        .toEqual(['defaultValue', 'path', 'isMounted', 'value', 'mySelector', 'myParamSelector'].sort());
    });

    test('should have a property reducer.defs containing the map of each declared reducer', () => {
      expect(driver.reducer.defs.myReducer).toBe(juncture.myReducer);
      expect(driver.reducer.defs.myMixReducer).toBe(juncture.myMixReducer);
      expect(Object.keys(driver.reducer.defs)).toHaveLength(2);
    });

    test('should have a property reducer.keys containing the reducer keys', () => {
      expect((driver.reducer.keys as string[]).sort())
        .toEqual(['myReducer', 'myMixReducer'].sort());
    });
  });
});
