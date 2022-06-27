/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Frame, FrameConfig } from '../frame/frame';
import { Juncture } from '../juncture';
import { Driver } from '../kernel/driver';
import { createSchemaDefinition, Schema } from '../kernel/schema';
import { isDirectSelectorDefinition } from '../kernel/selector';
import { jSymbols } from '../symbols';

describe('Juncture', () => {
  class MySchema extends Schema<string> {
    constructor() {
      super('');
    }
  }
  class MyFrame<J extends MyJuncture> extends Frame<J> { }
  class MyJuncture extends Juncture {
    schema = createSchemaDefinition(() => new MySchema());

    [jSymbols.createFrame] = (config: FrameConfig) => new MyFrame(this, config);
  }

  test('should be a class instantiable without arguments', () => {
    const juncture = new MyJuncture();
    expect(juncture).toBeInstanceOf(Juncture);
  });

  describe('instance', () => {
    let juncture: MyJuncture;

    beforeEach(() => {
      juncture = new MyJuncture();
    });

    test('should contain a "defaultValue" direct selector', () => {
      expect(isDirectSelectorDefinition(juncture.defaultValue)).toBe(true);
    });

    test('should contain a "path" direct selector', () => {
      expect(isDirectSelectorDefinition(juncture.path)).toBe(true);
    });

    test('should contain a "attached" direct selector', () => {
      expect(isDirectSelectorDefinition(juncture.isAttached)).toBe(true);
    });

    test('should contain a "value" direct selector', () => {
      expect(isDirectSelectorDefinition(juncture.value)).toBe(true);
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
        expect(driver.selectors.defaultValue).toBe(juncture.defaultValue);
        expect(driver.selectors.path).toBe(juncture.path);
        expect(driver.selectors.isAttached).toBe(juncture.isAttached);
        expect(driver.selectors.value).toBe(juncture.value);
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

      test('should create a new Frame for the provided Juncture instance', () => {
        const juncture = Juncture.getInstance(MyJuncture);
        const frame = Juncture.createFrame(juncture, config);
        expect(frame).toBeInstanceOf(Frame);
        expect(frame.juncture).toBe(juncture);
      });

      test('should lazily invoke the instance method [jSymbols.createFrame]', () => {
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
