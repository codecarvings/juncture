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
import { createSynthReactor } from '../../../design/descriptors/synth-reactor';
import { jSymbols } from '../../../symbols';

describe('createSynthReactor', () => {
  test('should create a SynthReactor by passing a reactor function only', () => {
    const myReactor = () => () => [];
    const desc = createSynthReactor(myReactor);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.synthReactor);
    expect(desc[jSymbols.payload]).toBe(myReactor);
    expect(desc.access).toBe(AccessModifier.public);
  });

  test('should create a GenericSynthReactor by passing a reactor function and an access specifier', () => {
    const myReactor = () => () => [];
    const myAccess = AccessModifier.private;
    const desc = createSynthReactor(myReactor, myAccess);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.synthReactor);
    expect(desc[jSymbols.payload]).toBe(myReactor);
    expect(desc.access).toBe(myAccess);
  });
});
