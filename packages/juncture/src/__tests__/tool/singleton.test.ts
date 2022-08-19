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

class MyType {}

describe('Singleton', () => {
  describe('instance', () => {
    test('should have a "Type" property', () => {
      const singleton = Singleton.get(MyType);
      expect(singleton.Type).toBe(MyType);
    });
    test('should have a "instance" property', () => {
      const singleton = Singleton.get(MyType);
      expect(singleton.instance).toBeInstanceOf(MyType);
    });
  });

  describe('static', () => {
    describe('get', () => {
      test('should be a method', () => {
        expect(typeof Singleton.get).toBe('function');
      });

      test('should return a Singleton object ', () => {
        const singleton = Singleton.get(MyType);
        expect(singleton).toBeInstanceOf(Singleton);
        expect(singleton.Type).toBe(MyType);
        expect(singleton.instance).toBeInstanceOf(MyType);
      });

      test('should always return the same Singleton instance', () => {
        const singleton1 = Singleton.get(MyType);
        const singleton2 = Singleton.get(MyType);
        expect(singleton2).toBe(singleton1);
      });

      test('should return the singleton of a subclass', () => {
        const singleton = Singleton.get(MyType);

        class MyType2 extends MyType { }

        const singleton2A = Singleton.get(MyType2);
        expect(singleton2A).not.toBe(singleton);
        expect(singleton2A.Type).not.toBe(singleton.Type);
        expect(singleton2A.instance).not.toBe(singleton.instance);
        expect(singleton2A.Type).toBe(MyType2);
        expect(singleton2A.instance).toBeInstanceOf(MyType2);

        const singleton2B = Singleton.get(MyType2);
        expect(singleton2A).toBe(singleton2B);
      });

      describe('when passing an Initializable type', () => {
        test('should invoke the [jSymbols.init] method of the object when the Singleton is created', () => {
          let totCalls = 0;
          class MyInitializableType {
            // eslint-disable-next-line class-methods-use-this
            [jSymbols.init]() {
              totCalls += 1;
            }
          }

          Singleton.get(MyInitializableType);
          expect(totCalls).toBe(1);

          Singleton.get(MyInitializableType);
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
