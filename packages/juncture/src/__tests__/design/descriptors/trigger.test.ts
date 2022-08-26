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
import { createTrigger } from '../../../design/descriptors/trigger';
import { jSymbols } from '../../../symbols';

describe('createTrigger', () => {
  test('should create a Trigger by passing a trigger function only', () => {
    const myTrigger = () => () => [];
    const desc = createTrigger(myTrigger);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.trigger);
    expect(desc[jSymbols.payload]).toBe(myTrigger);
    expect(desc.access).toBe(AccessModifier.public);
  });

  test('should create a GenericTrigger by passing a trigger function and an access specifier', () => {
    const myTrigger = () => () => [];
    const myAccess = AccessModifier.private;
    const desc = createTrigger(myTrigger, myAccess);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.trigger);
    expect(desc[jSymbols.payload]).toBe(myTrigger);
    expect(desc.access).toBe(myAccess);
  });
});
