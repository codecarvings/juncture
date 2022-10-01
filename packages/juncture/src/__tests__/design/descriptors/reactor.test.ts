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
import { createReactor } from '../../../design/descriptors/reactor';
import { junctureSymbols } from '../../../juncture-symbols';

describe('createReactor', () => {
  test('should create a Reactor by passing a reactor function only', () => {
    const myReactor = () => () => undefined;
    const desc = createReactor(myReactor);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.reactor);
    expect(desc[junctureSymbols.payload]).toBe(myReactor);
    expect(desc.access).toBe(AccessModifier.public);
  });

  test('should create a GenericReactor by passing a reactor function and an access specifier', () => {
    const myReactor = () => () => undefined;
    const myAccess = AccessModifier.private;
    const desc = createReactor(myReactor, myAccess);
    expect(isDescriptor(desc)).toBe(true);
    expect(desc.type).toBe(DescriptorType.reactor);
    expect(desc[junctureSymbols.payload]).toBe(myReactor);
    expect(desc.access).toBe(myAccess);
  });
});
