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
  isReducerDef,
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

describe('isReducerDef', () => {
  describe('when no subKind is provided', () => {
    test('should return true if an object is a PlainReducerDef', () => {
      const myReducer = () => () => undefined;
      const def = createPlainReducerDef(myReducer);
      expect(isReducerDef(def)).toBe(true);
    });

    test('should return true if an object is a MixReducerDef', () => {
      const myReducer = () => () => [];
      const def = createMixReducerDef(myReducer);
      expect(isReducerDef(def)).toBe(true);
    });

    test('should return false if an object is not a ReducerDef', () => {
      expect(isReducerDef(createDef(DefKind.selector, '', undefined))).toBe(false);
      expect(isReducerDef(null)).toBe(false);
      expect(isReducerDef(undefined)).toBe(false);
      expect(isReducerDef('dummy')).toBe(false);
    });
  });

  describe('when ReducerDefSubKind.plain is provided as subKind', () => {
    test('should return true if an object is a PlainReducerDef', () => {
      const myReducer = () => () => undefined;
      const def = createPlainReducerDef(myReducer);
      expect(isReducerDef(def, ReducerDefSubKind.plain)).toBe(true);
    });

    test('should return false if an object is a MixReducerDef', () => {
      const myReducer = () => () => [];
      const def = createMixReducerDef(myReducer);
      expect(isReducerDef(def, ReducerDefSubKind.plain)).toBe(false);
    });

    test('should return false if an object is not a ReducerDef', () => {
      expect(isReducerDef(createDef(DefKind.selector, '', undefined), ReducerDefSubKind.plain)).toBe(false);
      expect(isReducerDef(null, ReducerDefSubKind.plain)).toBe(false);
      expect(isReducerDef(undefined, ReducerDefSubKind.plain)).toBe(false);
      expect(isReducerDef('dummy', ReducerDefSubKind.plain)).toBe(false);
    });
  });

  describe('when ReducerDefSubKind.mix is provided as subKind', () => {
    test('should return true if an object is a MixReducerDef', () => {
      const myReducer = () => () => [];
      const def = createMixReducerDef(myReducer);
      expect(isReducerDef(def, ReducerDefSubKind.mix)).toBe(true);
    });

    test('should return false if an object is a PlainReducerDef', () => {
      const myReducer = () => () => undefined;
      const def = createPlainReducerDef(myReducer);
      expect(isReducerDef(def, ReducerDefSubKind.mix)).toBe(false);
    });

    test('should return false if an object is not a ReducerDef', () => {
      expect(isReducerDef(createDef(DefKind.selector, '', undefined), ReducerDefSubKind.mix)).toBe(false);
      expect(isReducerDef(null, ReducerDefSubKind.mix)).toBe(false);
      expect(isReducerDef(undefined, ReducerDefSubKind.mix)).toBe(false);
      expect(isReducerDef('dummy', ReducerDefSubKind.mix)).toBe(false);
    });
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

describe('createMixRedicerDef', () => {
  test('should create a MixReducerDefby passing a reducer', () => {
    const myReducer = () => () => [];
    const def = createMixReducerDef(myReducer);
    expect(def.defKind).toBe(DefKind.reducer);
    expect(def.defSubKind).toBe(ReducerDefSubKind.mix);
    expect(def[jSymbols.defPayload]).toBe(myReducer);
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
