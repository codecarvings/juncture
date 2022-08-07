/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createDef, DefAccess, DefType } from '../../definition/def';
import {
  createParamSelectorDef, createSelectorDef, isParamSelectorDef, isSelectorDef, UniSelectorDefVariety
} from '../../definition/selector';
import { jSymbols } from '../../symbols';

describe('createSelectorDef', () => {
  test('should create a SelectorDef by passing an access specifier and a selector', () => {
    const myAccess = DefAccess.private;
    const mySelector = () => undefined;
    const def = createSelectorDef(myAccess, mySelector);
    expect(def.type).toBe(DefType.selector);
    expect(def.variety).toBe(UniSelectorDefVariety.standard);
    expect(def.access).toBe(myAccess);
    expect(def[jSymbols.defPayload]).toBe(mySelector);
  });
});

describe('isSelectorDef', () => {
  describe('when no access is specified', () => {
    test('should return true if an object is a SelectorDef', () => {
      const mySelector = () => undefined;
      const def1 = createSelectorDef(DefAccess.public, mySelector);
      expect(isSelectorDef(def1)).toBe(true);
      const def2 = createSelectorDef(DefAccess.private, mySelector);
      expect(isSelectorDef(def2)).toBe(true);
    });

    test('should return false if an object is a ParamSelectorDef', () => {
      const mySelector = () => () => undefined;
      const def1 = createParamSelectorDef(DefAccess.public, mySelector);
      expect(isSelectorDef(def1)).toBe(false);
      const def2 = createParamSelectorDef(DefAccess.private, mySelector);
      expect(isSelectorDef(def2)).toBe(false);
    });

    test('should return false if an object is not a SelectorDef', () => {
      expect(isSelectorDef(createDef(DefType.schema, DefAccess.public, undefined))).toBe(false);
      expect(isSelectorDef(null)).toBe(false);
      expect(isSelectorDef(undefined)).toBe(false);
      expect(isSelectorDef('dummy')).toBe(false);
    });
  });

  describe('when access is provided', () => {
    test('should return true if an object is a SelectorDef with the specified access', () => {
      const mySelector = () => undefined;
      const def1 = createSelectorDef(DefAccess.public, mySelector);
      expect(isSelectorDef(def1, DefAccess.public)).toBe(true);
      const def2 = createSelectorDef(DefAccess.private, mySelector);
      expect(isSelectorDef(def2, DefAccess.private)).toBe(true);
    });

    test('should return false if an object is a SelectorDef with a wrong access', () => {
      const mySelector = () => undefined;
      const def1 = createSelectorDef(DefAccess.public, mySelector);
      expect(isSelectorDef(def1, DefAccess.private)).toBe(false);
      const def2 = createSelectorDef(DefAccess.private, mySelector);
      expect(isSelectorDef(def2, DefAccess.public)).toBe(false);
    });

    test('should return false if an object is a ParamSelectorDef', () => {
      const mySelector = () => () => undefined;
      const def1 = createParamSelectorDef(DefAccess.public, mySelector);
      expect(isSelectorDef(def1, DefAccess.public)).toBe(false);
      expect(isSelectorDef(def1, DefAccess.private)).toBe(false);
      const def2 = createParamSelectorDef(DefAccess.private, mySelector);
      expect(isSelectorDef(def2, DefAccess.public)).toBe(false);
      expect(isSelectorDef(def2, DefAccess.private)).toBe(false);
    });

    test('should return false if an object is not a SelectorDef', () => {
      expect(isSelectorDef(createDef(DefType.schema, DefAccess.public, undefined))).toBe(false);
      expect(isSelectorDef(null, DefAccess.public)).toBe(false);
      expect(isSelectorDef(null, DefAccess.private)).toBe(false);
      expect(isSelectorDef(undefined, DefAccess.public)).toBe(false);
      expect(isSelectorDef(undefined, DefAccess.private)).toBe(false);
      expect(isSelectorDef('dummy', DefAccess.public)).toBe(false);
      expect(isSelectorDef('dummy', DefAccess.private)).toBe(false);
    });
  });
});

describe('createParamSelectorDef', () => {
  test('should create a ParamSelectorDef by passing an access specifier and a selector', () => {
    const myAccess = DefAccess.private;
    const mySelector = () => () => undefined;
    const def = createParamSelectorDef(myAccess, mySelector);
    expect(def.type).toBe(DefType.selector);
    expect(def.variety).toBe(UniSelectorDefVariety.param);
    expect(def[jSymbols.defPayload]).toBe(mySelector);
  });
});

describe('isParamSelectorDef', () => {
  describe('when no access is specified', () => {
    test('should return true if an object is a ParamSelectorDef', () => {
      const mySelector = () => () => undefined;
      const def1 = createParamSelectorDef(DefAccess.public, mySelector);
      expect(isParamSelectorDef(def1)).toBe(true);
      const def2 = createParamSelectorDef(DefAccess.private, mySelector);
      expect(isParamSelectorDef(def2)).toBe(true);
    });

    test('should return false if an object is a SelectorDef', () => {
      const mySelector = () => undefined;
      const def1 = createSelectorDef(DefAccess.public, mySelector);
      expect(isParamSelectorDef(def1)).toBe(false);
      const def2 = createSelectorDef(DefAccess.private, mySelector);
      expect(isParamSelectorDef(def2)).toBe(false);
    });

    test('should return false if an object is not a ParamSelectorDef', () => {
      expect(isParamSelectorDef(createDef(DefType.schema, DefAccess.public, undefined))).toBe(false);
      expect(isParamSelectorDef(null)).toBe(false);
      expect(isParamSelectorDef(undefined)).toBe(false);
      expect(isParamSelectorDef('dummy')).toBe(false);
    });
  });

  describe('when access is provided', () => {
    test('should return true if an object is a ParamSelectorDef with the specified access', () => {
      const mySelector = () => () => undefined;
      const def1 = createParamSelectorDef(DefAccess.public, mySelector);
      expect(isParamSelectorDef(def1, DefAccess.public)).toBe(true);
      const def2 = createParamSelectorDef(DefAccess.private, mySelector);
      expect(isParamSelectorDef(def2, DefAccess.private)).toBe(true);
    });

    test('should return false if an object is a ParamSelectorDef with a wrong access', () => {
      const mySelector = () => () => undefined;
      const def1 = createParamSelectorDef(DefAccess.public, mySelector);
      expect(isParamSelectorDef(def1, DefAccess.private)).toBe(false);
      const def2 = createParamSelectorDef(DefAccess.private, mySelector);
      expect(isParamSelectorDef(def2, DefAccess.public)).toBe(false);
    });

    test('should return false if an object is a SelectorDef', () => {
      const mySelector = () => undefined;
      const def1 = createSelectorDef(DefAccess.public, mySelector);
      expect(isParamSelectorDef(def1, DefAccess.public)).toBe(false);
      expect(isParamSelectorDef(def1, DefAccess.private)).toBe(false);
      const def2 = createSelectorDef(DefAccess.private, mySelector);
      expect(isParamSelectorDef(def2, DefAccess.public)).toBe(false);
      expect(isParamSelectorDef(def2, DefAccess.private)).toBe(false);
    });

    test('should return false if an object is not a ParamSelectorDef', () => {
      expect(isParamSelectorDef(createDef(DefType.schema, DefAccess.public, undefined))).toBe(false);
      expect(isParamSelectorDef(null, DefAccess.public)).toBe(false);
      expect(isParamSelectorDef(null, DefAccess.private)).toBe(false);
      expect(isParamSelectorDef(undefined, DefAccess.public)).toBe(false);
      expect(isParamSelectorDef(undefined, DefAccess.private)).toBe(false);
      expect(isParamSelectorDef('dummy', DefAccess.public)).toBe(false);
      expect(isParamSelectorDef('dummy', DefAccess.private)).toBe(false);
    });
  });
});
