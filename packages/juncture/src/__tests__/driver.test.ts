/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchemaDef, Schema } from '../definition/schema';
import { Driver } from '../driver';
import { Frame, FrameConfig } from '../frame/frame';
import { Juncture } from '../juncture';
import { jSymbols } from '../symbols';

describe('Driver', () => {
  class MySchema extends Schema<string> {
    constructor() {
      super('');
    }
  }
  class MyFrame<J extends MyJuncture> extends Frame<J> { }
  class MyJuncture extends Juncture {
    schema = createSchemaDef(() => new MySchema());

    [jSymbols.createFrame] = (config: FrameConfig) => new MyFrame(this, config);

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

    test('should have a property "schema" with the schema object', () => {
      expect(driver.schema).toBeInstanceOf(MySchema);
    });

    test('should have a property "selectors" containing the map of each declared selector', () => {
      expect(driver.selectors.defaultValue).toBe(juncture.defaultValue);
      expect(driver.selectors.path).toBe(juncture.path);
      expect(driver.selectors.isMounted).toBe(juncture.isMounted);
      expect(driver.selectors.value).toBe(juncture.value);
      expect(driver.selectors.mySelector).toBe(juncture.mySelector);
      expect(driver.selectors.myParamSelector).toBe(juncture.myParamSelector);
      expect(Object.keys(driver.selectors)).toHaveLength(6);
    });

    test('should have a property "selectorKeys" containing the selector keys', () => {
      expect((driver.selectorKeys as string[]).sort())
        .toEqual(['defaultValue', 'path', 'isMounted', 'value', 'mySelector', 'myParamSelector'].sort());
    });

    test('should have a property "reducers" containing the map of each declared reducer', () => {
      expect(driver.reducers.myReducer).toBe(juncture.myReducer);
      expect(driver.reducers.myMixReducer).toBe(juncture.myMixReducer);
      expect(Object.keys(driver.reducers)).toHaveLength(2);
    });

    test('should have a property "reducerKeys" containing the reducer keys', () => {
      expect((driver.reducerKeys as string[]).sort())
        .toEqual(['myReducer', 'myMixReducer'].sort());
    });
  });
});
