/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefAccess, DefType, isDef } from '../../definition/def';
import { createSelectorDef } from '../../definition/selector';
import { jSymbols } from '../../symbols';

describe('createSelectorDef', () => {
  test('should create a public SelectorDef by passing a selector only', () => {
    const mySelector = () => undefined;
    const def = createSelectorDef(mySelector);
    expect(isDef(def)).toBe(true);
    expect(def.type).toBe(DefType.selector);
    expect(def[jSymbols.defPayload]).toBe(mySelector);
    expect(def.access).toBe(DefAccess.public);
  });

  test('should create a SelectorDef by passing an access specifier and a selector', () => {
    const mySelector = () => undefined;
    const myAccess = DefAccess.private;
    const def = createSelectorDef(mySelector, myAccess);
    expect(isDef(def)).toBe(true);
    expect(def.type).toBe(DefType.selector);
    expect(def[jSymbols.defPayload]).toBe(mySelector);
    expect(def.access).toBe(myAccess);
  });
});
