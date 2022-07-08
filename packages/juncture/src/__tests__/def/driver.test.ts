/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../def/driver';
import { createSchemaDef, Schema } from '../../def/schema';
import { Frame, FrameConfig } from '../../frame/frame';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';

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
  }

  let juncture: MyJuncture;
  beforeEach(() => {
    juncture = new MyJuncture();
  });

  test('should be a class instantiable by passing a Juncture instance', () => {
    const driver = new Driver(juncture);
    expect(driver).toBeInstanceOf(Driver);
  });

  describe('instance', () => {
    let driver: Driver<MyJuncture>;
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
      expect(Object.keys(driver.selectors)).toHaveLength(5);
    });

    test('should have a property "selectorKeys" containing the selector keys', () => {
      expect((driver.selectorKeys as string[]).sort())
        .toEqual(['defaultValue', 'path', 'isMounted', 'value', 'mySelector'].sort());
    });
  });
});
