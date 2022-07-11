/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { finalizeAssembling, registerAssemblableProp } from '../../util/assembler';

const createPropValue = <V>(container: object, value: V):
{ value: V, mockFn: jest.Mock<void, [string, object]> } => {
  const mockFn = jest.fn();
  const result = { value, mockFn };
  return registerAssemblableProp(container, result, mockFn);
};

describe('registerAssemblableProp', () => {
  describe('should return the provided value', () => {
    const value1 = { value: 'test1' };
    class Test1 {
      myVal1 = registerAssemblableProp(this, value1);
    }
    const test1 = new Test1();
    finalizeAssembling(test1);
    expect(test1.myVal1).toBe(value1);
  });

  describe('allow to register a callback that', () => {
    test('should receive the property key as first argument', () => {
      class Test1 {
        myVal1 = createPropValue(this, 'test1');
      }
      const test1 = new Test1();
      finalizeAssembling(test1);
      expect(test1.myVal1.mockFn.mock.lastCall[0]).toBe('myVal1');
    });

    test('should receive <undefined> as second argument if the property is not an override', () => {
      class Test1 {
        myVal1 = createPropValue(this, 'test1');
      }
      const test1 = new Test1();
      finalizeAssembling(test1);
      expect(test1.myVal1.mockFn.mock.lastCall[1]).toBeUndefined();
    });

    test('should receive the parent property value as second argument if the property is an override', () => {
      class Test1 {
        myVal1 = createPropValue(this, 'test1');
      }
      class Test2 extends Test1 {
        myVal1 = createPropValue(this, 'test2');
      }
      const test2 = new Test2();
      finalizeAssembling(test2);
      expect((test2.myVal1.mockFn.mock.lastCall[1] as any).value).toBe('test1');

      class Test3 extends Test2 {
        myVal2 = createPropValue(this, 'test3b');

        myVal1 = createPropValue(this, 'test3');

        myVal3 = createPropValue(this, 'test3c');
      }
      const test3 = new Test3();
      expect((test3.myVal1.mockFn.mock.lastCall[1] as any).value).toBe('test2');
      finalizeAssembling(test3);
    });
  });

  describe('should be able to be invoked without a callback', () => {
    const value1 = { value: 'test1' };
    class Test1 {
      myVal1 = registerAssemblableProp(this, value1);
    }

    jest.useFakeTimers();
    expect(() => {
      const test1 = new Test1();
      finalizeAssembling(test1);
      jest.runAllTimers();
    }).not.toThrow();

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const test1 = new Test1();
      jest.runAllTimers();
    }).toThrow();
    jest.useRealTimers();
  });

  // eslint-disable-next-line max-len
  test('should invoke the callback registerd with the preceding invokation of registerAssemblableProp in the same class', () => {
    class Test1 {
      myVal1 = createPropValue(this, 'test1');

      myVal2 = createPropValue(this, 'test2');
    }
    const test1 = new Test1();
    expect(test1.myVal1.mockFn).toHaveBeenCalledTimes(1);
    finalizeAssembling(test1);
    expect(test1.myVal1.mockFn).toHaveBeenCalledTimes(1);
  });

  // eslint-disable-next-line max-len
  test('should invoke the callback registerd with the preceding invokation of registerAssemblableProp in the parent class', () => {
    class Test1 {
      myVal1 = createPropValue(this, 'test1');
    }
    class Test2 extends Test1 {
      myVal2 = createPropValue(this, 'test2');
    }

    const test2 = new Test2();
    expect(test2.myVal1.mockFn).toHaveBeenCalledTimes(1);
    finalizeAssembling(test2);
    expect(test2.myVal1.mockFn).toHaveBeenCalledTimes(1);
  });

  test('should automatically throw (async) if finalizeAssembling is not invoked after instance creation', () => {
    class Test1 {
      myVal1 = createPropValue(this, 'test1');
    }

    jest.useFakeTimers();
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const test1 = new Test1();
      jest.runAllTimers();
    }).toThrow();
    jest.useRealTimers();
  });
});

describe('finalizeAssembling', () => {
  test('should invoke the callback of the last property registerd with registerAssemblableProp', () => {
    class Test1 {
      myVal1 = createPropValue(this, 'test1');

      myVal2 = createPropValue(this, 'test2');
    }
    const test1 = new Test1();
    expect(test1.myVal2.mockFn).toHaveBeenCalledTimes(0);
    finalizeAssembling(test1);
    expect(test1.myVal2.mockFn).toHaveBeenCalledTimes(1);
  });

  test('should not throw if the instance has no properties registerd with registerAssemblableProp', () => {
    class Test1 {
    }
    const test1 = new Test1();
    expect(() => {
      finalizeAssembling(test1);
    }).not.toThrow();
  });

  test('should not throw if invoked multiple times', () => {
    class Test1 {
    }
    const test1 = new Test1();
    expect(() => {
      finalizeAssembling(test1);
      finalizeAssembling(test1);
      finalizeAssembling(test1);
    }).not.toThrow();
  });
});
