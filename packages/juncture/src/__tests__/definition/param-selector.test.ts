/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefAccess, DefType, isDef } from '../../definition/def';
import { createParamSelectorDef } from '../../definition/param-selector';
import { jSymbols } from '../../symbols';

describe('createParamSelectorDef', () => {
  test('should create a public ParamSelectorDef by passing a selector only', () => {
    const mySelector = () => () => undefined;
    const def = createParamSelectorDef(mySelector);
    expect(isDef(def)).toBe(true);
    expect(def.type).toBe(DefType.paramSelector);
    expect(def[jSymbols.defPayload]).toBe(mySelector);
    expect(def.access).toBe(DefAccess.public);
  });

  test('should create a ParamSelectorDef by passing a selector and an access specifier', () => {
    const mySelector = () => () => undefined;
    const myAccess = DefAccess.private;
    const def = createParamSelectorDef(mySelector, myAccess);
    expect(isDef(def)).toBe(true);
    expect(def.type).toBe(DefType.paramSelector);
    expect(def[jSymbols.defPayload]).toBe(mySelector);
    expect(def.access).toBe(myAccess);
  });
});
