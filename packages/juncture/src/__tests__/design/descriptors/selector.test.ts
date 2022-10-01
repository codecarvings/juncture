/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../../access-modifier';
import { isDescriptor } from '../../../design/descriptor';
import { DescriptorType } from '../../../design/descriptor-type';
import { createSelector } from '../../../design/descriptors/selector';
import { junctureSymbols } from '../../../juncture-symbols';

describe('createSelector', () => {
  test('should create a Selector by passing a selector function only', () => {
    const mySelector = () => undefined;
    const desc = createSelector(mySelector);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.selector);
    expect(desc[junctureSymbols.payload]).toBe(mySelector);
    expect(desc.access).toBe(AccessModifier.public);
  });

  test('should create a GenericSelector by passing a selector function and an access specifier', () => {
    const mySelector = () => undefined;
    const myAccess = AccessModifier.private;
    const desc = createSelector(mySelector, myAccess);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.selector);
    expect(desc[junctureSymbols.payload]).toBe(mySelector);
    expect(desc.access).toBe(myAccess);
  });
});
