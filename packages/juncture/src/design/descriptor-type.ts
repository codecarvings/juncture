/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export enum DescriptorType {
  schema = 'schema',
  selector = 'selector',
  paramSelector = 'paramSelector',
  reducer = 'reducer',
  trigger = 'trigger',
  reactor = 'reactor'
}

export type NotSuitableType = '\u26A0 ERROR: NOT SUITABLE TYPE';

export const selectableDescriptorTypes = [DescriptorType.selector, DescriptorType.paramSelector];
export const applicableDescriptorTypes = [DescriptorType.reducer, DescriptorType.trigger];
export const observableDescriptorTypes = [DescriptorType.selector, DescriptorType.paramSelector];
