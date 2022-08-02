/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createDef, DefKind } from '../../definition/def';
import {
  createMixReducerDef, createReducerDef, isMixReducerDef, isReducerDef,
  UniReducerDefSubKind
} from '../../definition/reducer';
import { jSymbols } from '../../symbols';

describe('createReducerDef', () => {
  test('should create a ReducerDef by passing a reducer', () => {
    const myReducer = () => () => undefined;
    const def = createReducerDef(myReducer);
    expect(def.defKind).toBe(DefKind.reducer);
    expect(def.defSubKind).toBe(UniReducerDefSubKind.standard);
    expect(def[jSymbols.defPayload]).toBe(myReducer);
  });
});

describe('isReducerDef', () => {
  test('should return true if an object is a ReducerDef', () => {
    const myReducer = () => () => undefined;
    const def = createReducerDef(myReducer);
    expect(isReducerDef(def)).toBe(true);
  });

  test('should return false if an object is a MixReducerDef', () => {
    const myReducer = () => () => [];
    const def = createMixReducerDef(myReducer);
    expect(isReducerDef(def)).toBe(false);
  });

  test('should return false if an object is not a ReducerDef', () => {
    expect(isReducerDef(createDef(DefKind.selector, '', undefined))).toBe(false);
    expect(isReducerDef(null)).toBe(false);
    expect(isReducerDef(undefined)).toBe(false);
    expect(isReducerDef('dummy')).toBe(false);
  });
});

describe('createMixRedicerDef', () => {
  test('should create a MixReducerDefby passing a reducer', () => {
    const myReducer = () => () => [];
    const def = createMixReducerDef(myReducer);
    expect(def.defKind).toBe(DefKind.reducer);
    expect(def.defSubKind).toBe(UniReducerDefSubKind.mix);
    expect(def[jSymbols.defPayload]).toBe(myReducer);
  });
});

describe('isMixReducerDef', () => {
  test('should return true if an object is a MixReducerDef', () => {
    const myReducer = () => () => [];
    const def = createMixReducerDef(myReducer);
    expect(isMixReducerDef(def)).toBe(true);
  });

  test('should return false if an object is a ReducerDef', () => {
    const myReducer = () => () => undefined;
    const def = createReducerDef(myReducer);
    expect(isMixReducerDef(def)).toBe(false);
  });

  test('should return false if an object is not a MixReducerDef', () => {
    expect(isReducerDef(createDef(DefKind.selector, '', undefined))).toBe(false);
    expect(isMixReducerDef(null)).toBe(false);
    expect(isMixReducerDef(undefined)).toBe(false);
    expect(isMixReducerDef('dummy')).toBe(false);
  });
});
