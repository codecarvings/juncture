/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createDef, DefKind } from '../../definition/def';
import {
  createDirectSelectorDef,
  createParamSelectorDef,
  isDirectSelectorDef,
  isParamSelectorDef,
  SelectorDefSubKind
} from '../../definition/selector';
import { jSymbols } from '../../symbols';

describe('createDirectSelectorDef', () => {
  test('should create a DiretSelectorDef by passing a selector', () => {
    const mySelector = () => undefined;
    const def = createDirectSelectorDef(mySelector);
    expect(def.defKind).toBe(DefKind.selector);
    expect(def.defSubKind).toBe(SelectorDefSubKind.direct);
    expect(def[jSymbols.defPayload]).toBe(mySelector);
  });
});

describe('isDirectSelectorDef', () => {
  test('should return true if an object is a DirectSelectorDef', () => {
    const mySelector = () => undefined;
    const def = createDirectSelectorDef(mySelector);
    expect(isDirectSelectorDef(def)).toBe(true);
  });

  test('should return false if an object is a ParamSelectorDef', () => {
    const mySelector = () => () => undefined;
    const def = createParamSelectorDef(mySelector);
    expect(isDirectSelectorDef(def)).toBe(false);
  });

  test('should return false if an object is not a DirectSelectorDef', () => {
    expect(isDirectSelectorDef(createDef(DefKind.schema, '', undefined))).toBe(false);
    expect(isDirectSelectorDef(null)).toBe(false);
    expect(isDirectSelectorDef(undefined)).toBe(false);
    expect(isDirectSelectorDef('dummy')).toBe(false);
  });
});

describe('createParamSelectorDef', () => {
  test('should create a ParamSelectorDef by passing a selector', () => {
    const mySelector = () => () => undefined;
    const def = createParamSelectorDef(mySelector);
    expect(def.defKind).toBe(DefKind.selector);
    expect(def.defSubKind).toBe(SelectorDefSubKind.param);
    expect(def[jSymbols.defPayload]).toBe(mySelector);
  });
});

describe('isParamSelectorDef', () => {
  test('should return true if an object is a ParamSelectorDef', () => {
    const mySelector = () => () => undefined;
    const def = createParamSelectorDef(mySelector);
    expect(isParamSelectorDef(def)).toBe(true);
  });

  test('should return false if an object is a DirectSelectorDef', () => {
    const mySelector = () => undefined;
    const def = createDirectSelectorDef(mySelector);
    expect(isParamSelectorDef(def)).toBe(false);
  });

  test('should return false if an object is not a ParamSelectorDef', () => {
    expect(isParamSelectorDef(createDef(DefKind.schema, '', undefined))).toBe(false);
    expect(isParamSelectorDef(null)).toBe(false);
    expect(isParamSelectorDef(undefined)).toBe(false);
    expect(isParamSelectorDef('dummy')).toBe(false);
  });
});
