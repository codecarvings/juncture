/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineLazyProperty, mappedAssign } from '../../tool/object';

describe('defineLazyProperty', () => {
  // eslint-disable-next-line max-len
  test('should define a configurable, non-writable, non-enumerable getter property on a object that is transformed into a non-configurable, non-writable, non-enumerable property value after the first access', () => {
    const obj: any = {};
    const fnResult = { ok: 1 };
    const fn = () => fnResult;
    defineLazyProperty(obj, 'myKey', fn);

    let property = Object.getOwnPropertyDescriptor(obj, 'myKey');
    expect(property?.configurable).toBe(true);
    expect(property?.writable).toBe(undefined);
    expect(property?.enumerable).toBe(false);

    expect(obj.myKey).toBe(fnResult);
    property = Object.getOwnPropertyDescriptor(obj, 'myKey');
    expect(property?.configurable).toBe(false);
    expect(property?.writable).toBe(false);
    expect(property?.enumerable).toBe(false);
  });

  test('should provide an option to make the property configurable after the first access', () => {
    const obj: any = {};
    const fnResult = { ok: 1 };
    const fn = () => fnResult;
    defineLazyProperty(obj, 'myKey', fn, { configurable: true });

    let property = Object.getOwnPropertyDescriptor(obj, 'myKey');
    expect(property?.configurable).toBe(true);
    expect(property?.writable).toBe(undefined);
    expect(property?.enumerable).toBe(false);

    expect(obj.myKey).toBe(fnResult);
    property = Object.getOwnPropertyDescriptor(obj, 'myKey');
    expect(property?.configurable).toBe(true);
    expect(property?.writable).toBe(false);
    expect(property?.enumerable).toBe(false);
  });

  test('should provide an option to make the property writable after the first access', () => {
    const obj: any = {};
    const fnResult = { ok: 1 };
    const fn = () => fnResult;
    defineLazyProperty(obj, 'myKey', fn, { writable: true });

    let property = Object.getOwnPropertyDescriptor(obj, 'myKey');
    expect(property?.configurable).toBe(true);
    expect(property?.writable).toBe(undefined);
    expect(property?.enumerable).toBe(false);

    expect(obj.myKey).toBe(fnResult);
    property = Object.getOwnPropertyDescriptor(obj, 'myKey');
    expect(property?.configurable).toBe(false);
    expect(property?.writable).toBe(true);
    expect(property?.enumerable).toBe(false);
  });

  test('should provide an option to make the property enumerable after the first access', () => {
    const obj: any = {};
    const fnResult = { ok: 1 };
    const fn = () => fnResult;
    defineLazyProperty(obj, 'myKey', fn, { enumerable: true });

    let property = Object.getOwnPropertyDescriptor(obj, 'myKey');
    expect(property?.configurable).toBe(true);
    expect(property?.writable).toBe(undefined);
    expect(property?.enumerable).toBe(true);

    expect(obj.myKey).toBe(fnResult);
    property = Object.getOwnPropertyDescriptor(obj, 'myKey');
    expect(property?.configurable).toBe(false);
    expect(property?.writable).toBe(false);
    expect(property?.enumerable).toBe(true);
  });

  // eslint-disable-next-line max-len
  test('should define a getter property on a object that invokes the provided function only once and after the property is accessed', () => {
    const obj: any = {};
    const fnResult = { ok: 1 };
    const fn = jest.fn(() => fnResult);
    defineLazyProperty(obj, 'myKey', fn);

    expect(fn).toHaveBeenCalledTimes(0);
    expect(obj.myKey).toBe(fnResult);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(obj.myKey).toBe(fnResult);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('mappedAssign', () => {
  let originalObject: any;
  const keys = ['a', 'b', 'c'];
  const mapFn = (key: string) => keys.indexOf(key);

  beforeEach(() => {
    originalObject = {};
  });

  test('should allow to populate a map by mapping an array of keys', () => {
    mappedAssign(originalObject, keys, mapFn);
    expect(originalObject.a).toBe(0);
    expect(originalObject.b).toBe(1);
    expect(originalObject.c).toBe(2);
  });

  test('should return the object', () => {
    const result = mappedAssign(originalObject, keys, mapFn);
    expect(result).toBe(originalObject);
  });
});
