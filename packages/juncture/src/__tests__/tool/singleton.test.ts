/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { jSymbols } from '../../symbols';
import { Singleton } from '../../tool/singleton';

class MyClass {}

describe('Singleton', () => {
  describe('instance', () => {
    test('should have a "Constructor" property', () => {
      const singleton = Singleton.get(MyClass);
      expect(singleton.Constructor).toBe(MyClass);
    });
    test('should have a "instance" property', () => {
      const singleton = Singleton.get(MyClass);
      expect(singleton.instance).toBeInstanceOf(MyClass);
    });
  });

  describe('static', () => {
    describe('get', () => {
      test('should be a method', () => {
        expect(typeof Singleton.get).toBe('function');
      });

      test('should return a Singleton object ', () => {
        const singleton = Singleton.get(MyClass);
        expect(singleton).toBeInstanceOf(Singleton);
        expect(singleton.Constructor).toBe(MyClass);
        expect(singleton.instance).toBeInstanceOf(MyClass);
      });

      test('should always return the same Singleton instance', () => {
        const singleton1 = Singleton.get(MyClass);
        const singleton2 = Singleton.get(MyClass);
        expect(singleton2).toBe(singleton1);
      });

      test('should return the singleton of a subclass', () => {
        const singleton = Singleton.get(MyClass);

        class MyClass2 extends MyClass { }

        const singleton2A = Singleton.get(MyClass2);
        expect(singleton2A).not.toBe(singleton);
        expect(singleton2A.Constructor).not.toBe(singleton.Constructor);
        expect(singleton2A.instance).not.toBe(singleton.instance);
        expect(singleton2A.Constructor).toBe(MyClass2);
        expect(singleton2A.instance).toBeInstanceOf(MyClass2);

        const singleton2B = Singleton.get(MyClass2);
        expect(singleton2A).toBe(singleton2B);
      });

      describe('when passing an Initializable constructor', () => {
        test('should invoke the [jSymbols.init] method of the object when the Singleton is created', () => {
          let totCalls = 0;
          class MyInitializableClass {
            // eslint-disable-next-line class-methods-use-this
            [jSymbols.init]() {
              totCalls += 1;
            }
          }

          Singleton.get(MyInitializableClass);
          expect(totCalls).toBe(1);

          Singleton.get(MyInitializableClass);
          expect(totCalls).toBe(1);
        });
      });
    });

    describe('getInstance', () => {
      test('should be a method', () => {
        expect(typeof Singleton.getInstance).toBe('function');
      });
    });
  });
});
