/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefAccess, DefType, isDef } from '../../definition/def';
import { createReducerDef } from '../../definition/reducer';
import { jSymbols } from '../../symbols';

describe('createReducerDef', () => {
  test('should create a public ReducerDef by passing a reducer only', () => {
    const myReducer = () => () => undefined;
    const def = createReducerDef(myReducer);
    expect(isDef(def)).toBe(true);
    expect(def.type).toBe(DefType.reducer);
    expect(def[jSymbols.defPayload]).toBe(myReducer);
    expect(def.access).toBe(DefAccess.public);
  });

  test('should create a ReducerDef by passing an access specifier and a reducer', () => {
    const myReducer = () => () => undefined;
    const myAccess = DefAccess.private;
    const def = createReducerDef(myReducer, myAccess);
    expect(isDef(def)).toBe(true);
    expect(def.type).toBe(DefType.reducer);
    expect(def[jSymbols.defPayload]).toBe(myReducer);
    expect(def.access).toBe(myAccess);
  });
});
