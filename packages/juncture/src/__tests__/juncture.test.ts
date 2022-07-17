/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefComposer } from '../definition/composer';
import { createSchemaDef, isSchemaDef, Schema } from '../definition/schema';
import { isDirectSelectorDef } from '../definition/selector';
import { Driver } from '../driver';
import { Frame, FrameConfig } from '../frame/frame';
import { Juncture } from '../juncture';
import { jSymbols } from '../symbols';

describe('Juncture', () => {
  class MyJuncture extends Juncture {
    schema = createSchemaDef(() => new Schema(''));

    test = 21;

    len = this.DEF.selector(({ select }) => select().value.length);
  }

  test('should be a class instantiable without arguments', () => {
    const juncture = new MyJuncture();
    expect(juncture).toBeInstanceOf(Juncture);
  });

  describe('instance', () => {
    let juncture: MyJuncture;

    beforeEach(() => {
      juncture = Juncture.getInstance(MyJuncture);
    });

    describe('[jSymbols.createFrame] method', () => {
      const config: FrameConfig = {
        layout: {
          parent: null,
          path: [],
          isDivergent: false,
          isUnivocal: true
        }
      };

      test('should create a new Frame for the provided Juncture instance and config', () => {
        const frame = juncture[jSymbols.createFrame](config);
        expect(frame).toBeInstanceOf(Frame);
        expect(frame.juncture).toBe(juncture);
        expect(frame.layout).toBe(config.layout);
      });
    });

    test('should contain the DEF composer', () => {
      expect((juncture as any).DEF).toBeInstanceOf(DefComposer);
    });

    test('should contain the "schema"', () => {
      expect(isSchemaDef(juncture.schema)).toBe(true);
    });

    test('should contain a "defaultValue" direct selector', () => {
      expect(isDirectSelectorDef(juncture.defaultValue)).toBe(true);
    });

    test('should contain a "path" direct selector', () => {
      expect(isDirectSelectorDef(juncture.path)).toBe(true);
    });

    test('should contain a "isMounted" direct selector', () => {
      expect(isDirectSelectorDef(juncture.isMounted)).toBe(true);
    });

    test('should contain a "value" direct selector', () => {
      expect(isDirectSelectorDef(juncture.value)).toBe(true);
    });
  });

  describe('static', () => {
    describe('getInstance method', () => {
      test('should return an instance of the provided Juncture type', () => {
        const juncture = Juncture.getInstance(MyJuncture);
        expect(juncture).toBeInstanceOf(MyJuncture);
      });

      test('should always return the same instance', () => {
        const juncture1 = Juncture.getInstance(MyJuncture);
        const juncture2 = Juncture.getInstance(MyJuncture);
        expect(juncture1).toBe(juncture2);
      });

      test('should return the instance of a subclass', () => {
        const juncture = Juncture.getInstance(MyJuncture);
        expect(juncture).toBeInstanceOf(MyJuncture);

        class MyJuncture2 extends MyJuncture { }

        const juncture2A = Juncture.getInstance(MyJuncture2);
        const juncture2B = Juncture.getInstance(MyJuncture2);
        expect(juncture2A).toBeInstanceOf(MyJuncture2);
        expect(juncture2A).toBe(juncture2B);
      });
    });

    describe('getDriver method', () => {
      test('should return a Driver for the provided Juncture instance', () => {
        const juncture = Juncture.getInstance(MyJuncture);
        const driver = Juncture.getDriver(juncture);
        expect(driver).toBeInstanceOf(Driver);
        expect(driver.juncture).toBe(juncture);
      });

      test('should always return the same value', () => {
        const juncture = Juncture.getInstance(MyJuncture);
        const driver1 = Juncture.getDriver(juncture);
        const driver2 = Juncture.getDriver(juncture);
        expect(driver1).toBe(driver2);
      });

      test('should lazily invoke the instance method [jSymbols.createDriver]', () => {
        // No instance/driver cache
        class MyJuncture2 extends MyJuncture { }

        const juncture = Juncture.getInstance(MyJuncture2);
        const originalFactory = juncture[jSymbols.createDriver].bind(juncture);
        const factory = jest.fn(originalFactory);
        (juncture as any)[jSymbols.createDriver] = factory;

        expect(factory).toHaveBeenCalledTimes(0);
        Juncture.getDriver(juncture);
        expect(factory).toHaveBeenCalledTimes(1);
        Juncture.getDriver(juncture);
        expect(factory).toHaveBeenCalledTimes(1);
      });
    });

    describe('createFrame method', () => {
      const config: FrameConfig = {
        layout: {
          parent: null,
          path: [],
          isDivergent: false,
          isUnivocal: true
        }
      };

      test('should create a new Frame for the provided Juncture instance and config', () => {
        const juncture = Juncture.getInstance(MyJuncture);
        const frame = juncture[jSymbols.createFrame](config);
        expect(frame).toBeInstanceOf(Frame);
        expect(frame.juncture).toBe(juncture);
        expect(frame.layout).toBe(config.layout);
      });

      test('should invoke the instance method [jSymbols.createFrame]', () => {
        const juncture = Juncture.getInstance(MyJuncture);
        const originalFactory = juncture[jSymbols.createFrame].bind(juncture);
        const factory = jest.fn(originalFactory);
        (juncture as any)[jSymbols.createFrame] = factory;

        expect(factory).toHaveBeenCalledTimes(0);
        Juncture.createFrame(juncture, config);
        expect(factory).toHaveBeenCalledTimes(1);
        Juncture.createFrame(juncture, config);
        expect(factory).toHaveBeenCalledTimes(2);
      });
    });
  });
});
