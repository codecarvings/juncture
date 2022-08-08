/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefAccess, DefType, isDef } from '../../definition/def';
import { createTriggerDef } from '../../definition/trigger';
import { jSymbols } from '../../symbols';

describe('createTriggerDef', () => {
  test('should create a public TriggerDef by passing a trigger function only', () => {
    const myTrigger = () => () => [];
    const def = createTriggerDef(myTrigger);
    expect(isDef(def)).toBe(true);
    expect(def.type).toBe(DefType.trigger);
    expect(def[jSymbols.defPayload]).toBe(myTrigger);
    expect(def.access).toBe(DefAccess.public);
  });

  test('should create a TriggerDef by passing an access specifier and a trigger function', () => {
    const myTrigger = () => () => [];
    const myAccess = DefAccess.private;
    const def = createTriggerDef(myTrigger, myAccess);
    expect(isDef(def)).toBe(true);
    expect(def.type).toBe(DefType.trigger);
    expect(def[jSymbols.defPayload]).toBe(myTrigger);
    expect(def.access).toBe(myAccess);
  });
});
