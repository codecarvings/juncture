/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { StandardPropertyAssembler } from '../../definition/property-assembler';

describe('StandardPropertyAssembler', () => {
  const createPropertyValue = <V>(assembler: StandardPropertyAssembler, value: V):
  { value: V, mockFn: jest.Mock<void, [string, object]> } => {
    const mockFn = jest.fn();
    const result = { value, mockFn };
    return assembler.registerProperty(result, mockFn);
  };

  describe('constructor', () => {
    test('should accept the container object as the only argument', () => {
      const assembler = new StandardPropertyAssembler({});
      expect(assembler).toBeInstanceOf(StandardPropertyAssembler);
      assembler.close();
    });

    // eslint-disable-next-line max-len
    test('constructor should automatically (async) throw if "close" method is not invoked at the end of the instance initialization process', () => {
      jest.useFakeTimers();
      expect(() => {
        const assembler = new StandardPropertyAssembler({});
        expect(assembler).toBeInstanceOf(StandardPropertyAssembler);
        jest.runAllTimers();
      }).toThrow();
      jest.useRealTimers();
    });
  });

  describe('registerProperty', () => {
    test('should return the provided value', () => {
      const value1 = { value: 'test1' };
      class Test1 {
        assembler = new StandardPropertyAssembler(this);

        myVal1 = this.assembler.registerProperty(value1);
      }
      const test1 = new Test1();
      test1.assembler.close();
      expect(test1.myVal1).toBe(value1);
    });

    describe('allow to register a callback that', () => {
      test('should receive the property key as first argument', () => {
        class Test1 {
          assembler = new StandardPropertyAssembler(this);

          myVal1 = createPropertyValue(this.assembler, 'test1');
        }
        const test1 = new Test1();
        test1.assembler.close();
        expect(test1.myVal1.mockFn.mock.lastCall[0]).toBe('myVal1');
      });

      test('should receive <undefined> as second argument if the property is not an override', () => {
        class Test1 {
          assembler = new StandardPropertyAssembler(this);

          myVal1 = createPropertyValue(this.assembler, 'test1');
        }
        const test1 = new Test1();
        test1.assembler.close();
        expect(test1.myVal1.mockFn.mock.lastCall[1]).toBeUndefined();
      });

      test('should receive the parent property value as second argument if the property is an override', () => {
        class Test1 {
          assembler = new StandardPropertyAssembler(this);

          myVal1 = createPropertyValue(this.assembler, 'test1');
        }
        class Test2 extends Test1 {
          myVal1 = createPropertyValue(this.assembler, 'test2');
        }
        const test2 = new Test2();
        test2.assembler.close();
        expect((test2.myVal1.mockFn.mock.lastCall[1] as any).value).toBe('test1');

        class Test3 extends Test2 {
          myVal2 = createPropertyValue(this.assembler, 'test3b');

          myVal1 = createPropertyValue(this.assembler, 'test3');

          myVal3 = createPropertyValue(this.assembler, 'test3c');
        }
        const test3 = new Test3();
        test3.assembler.close();
        expect((test3.myVal1.mockFn.mock.lastCall[1] as any).value).toBe('test2');
      });
    });

    test('should be able to be invoked without a callback', () => {
      const value1 = { value: 'test1' };
      class Test1 {
        assembler = new StandardPropertyAssembler(this);

        myVal1 = this.assembler.registerProperty(value1);
      }

      jest.useFakeTimers();
      expect(() => {
        const test1 = new Test1();
        test1.assembler.close();
        jest.runAllTimers();
      }).not.toThrow();
      jest.useRealTimers();
    });

    // eslint-disable-next-line max-len
    test('should invoke the callback registerd with the preceding invokation of registerProperty in the same class', () => {
      class Test1 {
        assembler = new StandardPropertyAssembler(this);

        myVal1 = createPropertyValue(this.assembler, 'test1');

        myVal2 = createPropertyValue(this.assembler, 'test2');
      }
      const test1 = new Test1();
      expect(test1.myVal1.mockFn).toHaveBeenCalledTimes(1);
      test1.assembler.close();
      expect(test1.myVal1.mockFn).toHaveBeenCalledTimes(1);
    });

    // eslint-disable-next-line max-len
    test('should invoke the callback registerd with the preceding invokation of registerProperty in the parent class', () => {
      class Test1 {
        assembler = new StandardPropertyAssembler(this);

        myVal1 = createPropertyValue(this.assembler, 'test1');
      }
      class Test2 extends Test1 {
        myVal2 = createPropertyValue(this.assembler, 'test2');
      }

      const test2 = new Test2();
      expect(test2.myVal1.mockFn).toHaveBeenCalledTimes(1);
      test2.assembler.close();
      expect(test2.myVal1.mockFn).toHaveBeenCalledTimes(1);
    });

    test('should throw if isClosed is true', () => {
      const container = {} as any;
      const assembler = new StandardPropertyAssembler(container);
      expect(assembler.isClosed).toBe(false);
      expect(() => {
        container.myVal1 = assembler.registerProperty({ value: '1' });
      }).not.toThrow();
      assembler.close();
      expect(assembler.isClosed).toBe(true);
      expect(() => {
        container.myVal2 = assembler.registerProperty({ value: '2' });
      }).toThrow();
    });
  });

  describe('close', () => {
    test('should invoke the callback of the last property registerd with registerProperty', () => {
      class Test1 {
        assembler = new StandardPropertyAssembler(this);

        myVal1 = createPropertyValue(this.assembler, 'test1');

        myVal2 = createPropertyValue(this.assembler, 'test2');
      }
      const test1 = new Test1();
      expect(test1.myVal2.mockFn).toHaveBeenCalledTimes(0);
      test1.assembler.close();
      expect(test1.myVal2.mockFn).toHaveBeenCalledTimes(1);
    });

    test('should not throw if the instance has no properties registerd with registerProperty', () => {
      class Test1 {
        assembler = new StandardPropertyAssembler(this);
      }
      const test1 = new Test1();
      expect(() => {
        test1.assembler.close();
      }).not.toThrow();
    });

    test('should set isClosed to true', () => {
      class Test1 {
        assembler = new StandardPropertyAssembler(this);
      }
      const test1 = new Test1();
      expect(test1.assembler.isClosed).toBe(false);
      test1.assembler.close();
      expect(test1.assembler.isClosed).toBe(true);
    });

    test('should throw if isClosed is true', () => {
      class Test1 {
        assembler = new StandardPropertyAssembler(this);
      }
      const test1 = new Test1();
      expect(test1.assembler.isClosed).toBe(false);
      test1.assembler.close();
      expect(test1.assembler.isClosed).toBe(true);
      expect(() => {
        test1.assembler.close();
      }).toThrow();
    });
  });

  describe('isClosed', () => {
    test('should be false by default', () => {
      const container = {} as any;
      const assembler = new StandardPropertyAssembler(container);
      expect(assembler.isClosed).toBe(false);
    });
  });
});
