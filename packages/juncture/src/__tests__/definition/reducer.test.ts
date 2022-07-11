/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createDef, DefKind } from '../../definition/def';
import {
  createMixReducerDef, createPlainReducerDef, isMixReducerDef, isPlainReducerDef,
  ReducerDefSubKind
} from '../../definition/reducer';
import { jSymbols } from '../../symbols';

describe('createPlainReducerDef', () => {
  test('should create a PlainReducerDefn by passing a reducer', () => {
    const myReducer = () => () => undefined;
    const def = createPlainReducerDef(myReducer);
    expect(def.defKind).toBe(DefKind.reducer);
    expect(def.defSubKind).toBe(ReducerDefSubKind.plain);
    expect(def[jSymbols.defPayload]).toBe(myReducer);
  });
});

describe('createMixRedicerDef', () => {
  test('should create a MixReducerDefby passing a selector', () => {
    const myReducer = () => () => [];
    const def = createMixReducerDef(myReducer);
    expect(def.defKind).toBe(DefKind.reducer);
    expect(def.defSubKind).toBe(ReducerDefSubKind.mix);
    expect(def[jSymbols.defPayload]).toBe(myReducer);
  });
});

describe('isPlainReducerDef', () => {
  test('should return true if an object is a PlainReducerDef', () => {
    const myReducer = () => () => undefined;
    const def = createPlainReducerDef(myReducer);
    expect(isPlainReducerDef(def)).toBe(true);
  });

  test('should return false if an object is a MixReducerDef', () => {
    const myReducer = () => () => [];
    const def = createMixReducerDef(myReducer);
    expect(isPlainReducerDef(def)).toBe(false);
  });

  test('should return false if an object is not a PlainReducerDef', () => {
    expect(isPlainReducerDef(createDef(DefKind.selector, '', undefined))).toBe(false);
    expect(isPlainReducerDef(null)).toBe(false);
    expect(isPlainReducerDef(undefined)).toBe(false);
    expect(isPlainReducerDef('dummy')).toBe(false);
  });
});

describe('isMixReducerDef', () => {
  test('should return true if an object is a MixReducerDef', () => {
    const myReducer = () => () => [];
    const def = createMixReducerDef(myReducer);
    expect(isMixReducerDef(def)).toBe(true);
  });

  test('should return false if an object is a PlainReducerDef', () => {
    const myReducer = () => () => undefined;
    const def = createPlainReducerDef(myReducer);
    expect(isMixReducerDef(def)).toBe(false);
  });

  test('should return false if an object is not a MixReducerDef', () => {
    expect(isPlainReducerDef(createDef(DefKind.selector, '', undefined))).toBe(false);
    expect(isMixReducerDef(null)).toBe(false);
    expect(isMixReducerDef(undefined)).toBe(false);
    expect(isMixReducerDef('dummy')).toBe(false);
  });
});
