/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../../access';
import { isDescriptor } from '../../../design/descriptor';
import { DescriptorType } from '../../../design/descriptor-type';
import { createParamSelector } from '../../../design/descriptors/param-selector';
import { jSymbols } from '../../../symbols';

describe('createParamSelector', () => {
  test('should create a ParamSelector by passing a selector function only', () => {
    const mySelector = () => () => undefined;
    const desc = createParamSelector(mySelector);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.paramSelector);
    expect(desc[jSymbols.payload]).toBe(mySelector);
    expect(desc.access).toBe(AccessModifier.public);
  });

  test('should create a GenericParamSelector by passing a selector function and an access specifier', () => {
    const mySelector = () => () => undefined;
    const myAccess = AccessModifier.private;
    const desc = createParamSelector(mySelector, myAccess);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.paramSelector);
    expect(desc[jSymbols.payload]).toBe(mySelector);
    expect(desc.access).toBe(myAccess);
  });
});
