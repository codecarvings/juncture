/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../../construction/access-modifier';
import { DescriptorType, isDescriptor } from '../../../construction/descriptor';
import { createReducer } from '../../../construction/descriptors/reducer';
import { jSymbols } from '../../../symbols';

describe('createReducer', () => {
  test('should create a Reducer by passing a reducer function only', () => {
    const myReducer = () => () => undefined;
    const desc = createReducer(myReducer);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.reducer);
    expect(desc[jSymbols.payload]).toBe(myReducer);
    expect(desc.access).toBe(AccessModifier.public);
  });

  test('should create a GenericReducer by passing a reducer function and an access specifier', () => {
    const myReducer = () => () => undefined;
    const myAccess = AccessModifier.private;
    const desc = createReducer(myReducer, myAccess);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.reducer);
    expect(desc[jSymbols.payload]).toBe(myReducer);
    expect(desc.access).toBe(myAccess);
  });
});
