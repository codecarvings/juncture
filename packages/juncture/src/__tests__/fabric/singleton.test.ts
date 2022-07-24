/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Singleton } from '../../fabric/singleton';
import { jSymbols } from '../../symbols';
import { Constructable } from '../../util/object';

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

    describe('getSingletonPropertyAccessor', () => {
      const cacheKey = Symbol('test');
      const staticValue = { value: 1 };
      interface MyTestInstance {
        value: typeof staticValue;
      }
      let MyTest: Constructable<MyTestInstance>;
      function getNewMyTestClass() {
        return class NewMyTest {
          value = staticValue;
        };
      }

      beforeEach(() => {
        MyTest = getNewMyTestClass();
      });

      test('should be a method', () => {
        expect(typeof Singleton.getSingletonPropertyAccessor).toBe('function');
      });

      describe('when providing a cache key and a resolver', () => {
        test('should return a function', () => {
          const f = Singleton.getSingletonPropertyAccessor(Symbol('test'), () => undefined);
          expect(typeof f).toBe('function');
        });

        describe('the returned function', () => {
          test('should accept a Type as unique paramter', () => {
            const resolver = jest.fn((instance: MyTestInstance) => instance.value);

            const f = Singleton.getSingletonPropertyAccessor(cacheKey, resolver);
            expect(f(MyTest)).toBe(staticValue);
          });

          test('should accept an instance as unique parameter', () => {
            const resolver = jest.fn((instance: MyTestInstance) => instance.value);

            const f = Singleton.getSingletonPropertyAccessor(cacheKey, resolver);
            expect(f(Singleton.get(MyTest).instance)).toBe(staticValue);
          });

          test('should return the same value returned by the resolver', () => {
            const resolver = jest.fn((instance: MyTestInstance) => instance.value);

            const f = Singleton.getSingletonPropertyAccessor(cacheKey, resolver);
            expect(f(MyTest)).toBe(staticValue);
          });

          test('should always return the same value', () => {
            const resolver = jest.fn((instance: MyTestInstance) => instance.value);

            const f = Singleton.getSingletonPropertyAccessor(cacheKey, resolver);
            const v1 = f(MyTest);
            const v2 = f(MyTest);
            expect(v2).toBe(v1);
          });

          test('should use the resolver only one time the first time that is invoked', () => {
            const resolver = jest.fn(() => undefined);

            const f = Singleton.getSingletonPropertyAccessor(cacheKey, resolver);
            expect(resolver).toBeCalledTimes(0);
            f(MyTest);
            expect(resolver).toBeCalledTimes(1);
            f(MyTest);
            expect(resolver).toBeCalledTimes(1);
          });

          describe('when invokes the resolver, this', () => {
            test('should receive the instance as property', () => {
              const resolver = jest.fn((instance: MyTestInstance) => instance.value);

              const f = Singleton.getSingletonPropertyAccessor(cacheKey, resolver);
              f(MyTest);
              expect(resolver).toHaveBeenCalledWith(Singleton.get(MyTest).instance);
            });
          });
        });
      });

      describe('when providing a different cache key but the same resolver', () => {
        describe('the returned function', () => {
          test('should use a different cache', () => {
            const resolver = jest.fn((instance: MyTestInstance) => instance.value);

            const f1 = Singleton.getSingletonPropertyAccessor(cacheKey, resolver);
            expect(resolver).toBeCalledTimes(0);
            f1(MyTest);
            expect(resolver).toBeCalledTimes(1);

            const cacheKey2 = Symbol('test');
            const f2 = Singleton.getSingletonPropertyAccessor(cacheKey2, resolver);
            f1(MyTest);
            expect(resolver).toBeCalledTimes(1);
            f2(MyTest);
            expect(resolver).toBeCalledTimes(2);
            f1(MyTest);
            f2(MyTest);
            expect(resolver).toBeCalledTimes(2);
          });
        });
      });
    });
  });
});
