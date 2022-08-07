/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createDef, DefAccess, DefType } from '../../definition/def';
import {
  createMixReducerDef, createReducerDef, isMixReducerDef, isReducerDef,
  UniReducerDefVariety
} from '../../definition/reducer';
import { jSymbols } from '../../symbols';

describe('createReducerDef', () => {
  test('should create a ReducerDef by passing an access specifier and a reducer', () => {
    const myAccess = DefAccess.private;
    const myReducer = () => () => undefined;
    const def = createReducerDef(myAccess, myReducer);
    expect(def.type).toBe(DefType.reducer);
    expect(def.variety).toBe(UniReducerDefVariety.standard);
    expect(def.access).toBe(myAccess);
    expect(def[jSymbols.defPayload]).toBe(myReducer);
  });
});

describe('isReducerDef', () => {
  describe('when no access is specified', () => {
    test('should return true if an object is a ReducerDef', () => {
      const myReducer = () => () => undefined;
      const def1 = createReducerDef(DefAccess.public, myReducer);
      expect(isReducerDef(def1)).toBe(true);
      const def2 = createReducerDef(DefAccess.protected, myReducer);
      expect(isReducerDef(def2)).toBe(true);
      const def3 = createReducerDef(DefAccess.private, myReducer);
      expect(isReducerDef(def3)).toBe(true);
    });

    test('should return false if an object is a MixReducerDef', () => {
      const myReducer = () => () => [];
      const def1 = createMixReducerDef(DefAccess.public, myReducer);
      expect(isReducerDef(def1)).toBe(false);
      const def2 = createMixReducerDef(DefAccess.protected, myReducer);
      expect(isReducerDef(def2)).toBe(false);
      const def3 = createMixReducerDef(DefAccess.private, myReducer);
      expect(isReducerDef(def3)).toBe(false);
    });

    test('should return false if an object is not a ReducerDef', () => {
      expect(isReducerDef(createDef(DefType.selector, DefAccess.public, undefined))).toBe(false);
      expect(isReducerDef(null)).toBe(false);
      expect(isReducerDef(undefined)).toBe(false);
      expect(isReducerDef('dummy')).toBe(false);
    });
  });

  describe('when access is provided', () => {
    test('should return true if an object is a ReducerDef with the specified access', () => {
      const myReducer = () => () => undefined;
      const def1 = createReducerDef(DefAccess.public, myReducer);
      expect(isReducerDef(def1, DefAccess.public)).toBe(true);
      const def2 = createReducerDef(DefAccess.protected, myReducer);
      expect(isReducerDef(def2, DefAccess.protected)).toBe(true);
      const def3 = createReducerDef(DefAccess.private, myReducer);
      expect(isReducerDef(def3, DefAccess.private)).toBe(true);
    });

    test('should return false if an object is a ReducerDef with a wrong access', () => {
      const myReducer = () => () => undefined;
      const def1 = createReducerDef(DefAccess.public, myReducer);
      expect(isReducerDef(def1, DefAccess.protected)).toBe(false);
      expect(isReducerDef(def1, DefAccess.private)).toBe(false);
      const def2 = createReducerDef(DefAccess.protected, myReducer);
      expect(isReducerDef(def2, DefAccess.public)).toBe(false);
      expect(isReducerDef(def2, DefAccess.private)).toBe(false);
      const def3 = createReducerDef(DefAccess.private, myReducer);
      expect(isReducerDef(def3, DefAccess.public)).toBe(false);
      expect(isReducerDef(def3, DefAccess.protected)).toBe(false);
    });

    test('should return false if an object is a MixReducerDef', () => {
      const myReducer = () => () => [];
      const def1 = createMixReducerDef(DefAccess.public, myReducer);
      expect(isReducerDef(def1, DefAccess.public)).toBe(false);
      expect(isReducerDef(def1, DefAccess.protected)).toBe(false);
      expect(isReducerDef(def1, DefAccess.private)).toBe(false);
      const def2 = createMixReducerDef(DefAccess.protected, myReducer);
      expect(isReducerDef(def2, DefAccess.public)).toBe(false);
      expect(isReducerDef(def2, DefAccess.protected)).toBe(false);
      expect(isReducerDef(def2, DefAccess.private)).toBe(false);
      const def3 = createMixReducerDef(DefAccess.private, myReducer);
      expect(isReducerDef(def3, DefAccess.public)).toBe(false);
      expect(isReducerDef(def3, DefAccess.protected)).toBe(false);
      expect(isReducerDef(def3, DefAccess.private)).toBe(false);
    });

    test('should return false if an object is not a ReducerDef', () => {
      expect(isReducerDef(createDef(DefType.selector, DefAccess.public, undefined))).toBe(false);
      expect(isReducerDef(null, DefAccess.public)).toBe(false);
      expect(isReducerDef(null, DefAccess.protected)).toBe(false);
      expect(isReducerDef(null, DefAccess.private)).toBe(false);
      expect(isReducerDef(undefined, DefAccess.public)).toBe(false);
      expect(isReducerDef(undefined, DefAccess.protected)).toBe(false);
      expect(isReducerDef(undefined, DefAccess.private)).toBe(false);
      expect(isReducerDef('dummy', DefAccess.public)).toBe(false);
      expect(isReducerDef('dummy', DefAccess.protected)).toBe(false);
      expect(isReducerDef('dummy', DefAccess.private)).toBe(false);
    });
  });
});

describe('createMixRedicerDef', () => {
  test('should create a MixReducerDefby by passing an access specifier and a reducer', () => {
    const myAccess = DefAccess.private;
    const myReducer = () => () => [];
    const def = createMixReducerDef(myAccess, myReducer);
    expect(def.type).toBe(DefType.reducer);
    expect(def.variety).toBe(UniReducerDefVariety.mix);
    expect(def.access).toBe(myAccess);
    expect(def[jSymbols.defPayload]).toBe(myReducer);
  });
});

describe('isMixReducerDef', () => {
  describe('when no access is specified', () => {
    test('should return true if an object is a MixReducerDef', () => {
      const myReducer = () => () => [];
      const def1 = createMixReducerDef(DefAccess.public, myReducer);
      expect(isMixReducerDef(def1)).toBe(true);
      const def2 = createMixReducerDef(DefAccess.protected, myReducer);
      expect(isMixReducerDef(def2)).toBe(true);
      const def3 = createMixReducerDef(DefAccess.private, myReducer);
      expect(isMixReducerDef(def3)).toBe(true);
    });

    test('should return false if an object is a ReducerDef', () => {
      const myReducer = () => () => undefined;
      const def1 = createReducerDef(DefAccess.public, myReducer);
      expect(isMixReducerDef(def1)).toBe(false);
      const def2 = createReducerDef(DefAccess.protected, myReducer);
      expect(isMixReducerDef(def2)).toBe(false);
      const def3 = createReducerDef(DefAccess.private, myReducer);
      expect(isMixReducerDef(def3)).toBe(false);
    });

    test('should return false if an object is not a MixReducerDef', () => {
      expect(isReducerDef(createDef(DefType.selector, DefAccess.public, undefined))).toBe(false);
      expect(isMixReducerDef(null)).toBe(false);
      expect(isMixReducerDef(undefined)).toBe(false);
      expect(isMixReducerDef('dummy')).toBe(false);
    });
  });

  describe('when access is provided', () => {
    test('should return true if an object is a MixReducerDef with the specified access', () => {
      const myReducer = () => () => [];
      const def1 = createMixReducerDef(DefAccess.public, myReducer);
      expect(isMixReducerDef(def1, DefAccess.public)).toBe(true);
      const def2 = createMixReducerDef(DefAccess.protected, myReducer);
      expect(isMixReducerDef(def2, DefAccess.protected)).toBe(true);
      const def3 = createMixReducerDef(DefAccess.private, myReducer);
      expect(isMixReducerDef(def3, DefAccess.private)).toBe(true);
    });

    test('should return false if an object is a MixReducerDef with a wrong access', () => {
      const myReducer = () => () => [];
      const def1 = createMixReducerDef(DefAccess.public, myReducer);
      expect(isMixReducerDef(def1, DefAccess.protected)).toBe(false);
      expect(isMixReducerDef(def1, DefAccess.private)).toBe(false);
      const def2 = createMixReducerDef(DefAccess.protected, myReducer);
      expect(isMixReducerDef(def2, DefAccess.public)).toBe(false);
      expect(isMixReducerDef(def2, DefAccess.private)).toBe(false);
      const def3 = createMixReducerDef(DefAccess.private, myReducer);
      expect(isMixReducerDef(def3, DefAccess.public)).toBe(false);
      expect(isMixReducerDef(def3, DefAccess.protected)).toBe(false);
    });

    test('should return false if an object is a ReducerDef', () => {
      const myReducer = () => () => undefined;
      const def1 = createReducerDef(DefAccess.public, myReducer);
      expect(isMixReducerDef(def1, DefAccess.public)).toBe(false);
      expect(isMixReducerDef(def1, DefAccess.protected)).toBe(false);
      expect(isMixReducerDef(def1, DefAccess.private)).toBe(false);
      const def2 = createReducerDef(DefAccess.protected, myReducer);
      expect(isMixReducerDef(def2, DefAccess.public)).toBe(false);
      expect(isMixReducerDef(def2, DefAccess.protected)).toBe(false);
      expect(isMixReducerDef(def2, DefAccess.private)).toBe(false);
      const def3 = createReducerDef(DefAccess.private, myReducer);
      expect(isMixReducerDef(def3, DefAccess.public)).toBe(false);
      expect(isMixReducerDef(def3, DefAccess.protected)).toBe(false);
      expect(isMixReducerDef(def3, DefAccess.private)).toBe(false);
    });

    test('should return false if an object is not a MixReducerDef', () => {
      expect(isReducerDef(createDef(DefType.selector, DefAccess.public, undefined))).toBe(false);
      expect(isMixReducerDef(null, DefAccess.public)).toBe(false);
      expect(isMixReducerDef(null, DefAccess.protected)).toBe(false);
      expect(isMixReducerDef(null, DefAccess.private)).toBe(false);
      expect(isMixReducerDef(undefined, DefAccess.public)).toBe(false);
      expect(isMixReducerDef(undefined, DefAccess.protected)).toBe(false);
      expect(isMixReducerDef(undefined, DefAccess.private)).toBe(false);
      expect(isMixReducerDef('dummy', DefAccess.public)).toBe(false);
      expect(isMixReducerDef('dummy', DefAccess.protected)).toBe(false);
      expect(isMixReducerDef('dummy', DefAccess.private)).toBe(false);
    });
  });
});
