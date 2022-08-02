/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createDef, DefKind } from '../../definition/def';
import {
  createParamSelectorDef, createSelectorDef, isParamSelectorDef, isSelectorDef, UniSelectorDefSubKind
} from '../../definition/selector';
import { jSymbols } from '../../symbols';

describe('createSelectorDef', () => {
  test('should create a SelectorDef by passing a selector', () => {
    const mySelector = () => undefined;
    const def = createSelectorDef(mySelector);
    expect(def.defKind).toBe(DefKind.selector);
    expect(def.defSubKind).toBe(UniSelectorDefSubKind.standard);
    expect(def[jSymbols.defPayload]).toBe(mySelector);
  });
});

describe('isSelectorDef', () => {
  test('should return true if an object is a SelectorDef', () => {
    const mySelector = () => undefined;
    const def = createSelectorDef(mySelector);
    expect(isSelectorDef(def)).toBe(true);
  });

  test('should return false if an object is a ParamSelectorDef', () => {
    const mySelector = () => () => undefined;
    const def = createParamSelectorDef(mySelector);
    expect(isSelectorDef(def)).toBe(false);
  });

  test('should return false if an object is not a SelectorDef', () => {
    expect(isSelectorDef(createDef(DefKind.schema, '', undefined))).toBe(false);
    expect(isSelectorDef(null)).toBe(false);
    expect(isSelectorDef(undefined)).toBe(false);
    expect(isSelectorDef('dummy')).toBe(false);
  });
});

describe('createParamSelectorDef', () => {
  test('should create a ParamSelectorDef by passing a selector', () => {
    const mySelector = () => () => undefined;
    const def = createParamSelectorDef(mySelector);
    expect(def.defKind).toBe(DefKind.selector);
    expect(def.defSubKind).toBe(UniSelectorDefSubKind.param);
    expect(def[jSymbols.defPayload]).toBe(mySelector);
  });
});

describe('isParamSelectorDef', () => {
  test('should return true if an object is a ParamSelectorDef', () => {
    const mySelector = () => () => undefined;
    const def = createParamSelectorDef(mySelector);
    expect(isParamSelectorDef(def)).toBe(true);
  });

  test('should return false if an object is a SelectorDef', () => {
    const mySelector = () => undefined;
    const def = createSelectorDef(mySelector);
    expect(isParamSelectorDef(def)).toBe(false);
  });

  test('should return false if an object is not a ParamSelectorDef', () => {
    expect(isParamSelectorDef(createDef(DefKind.schema, '', undefined))).toBe(false);
    expect(isParamSelectorDef(null)).toBe(false);
    expect(isParamSelectorDef(undefined)).toBe(false);
    expect(isParamSelectorDef('dummy')).toBe(false);
  });
});
