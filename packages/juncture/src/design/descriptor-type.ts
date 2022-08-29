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
  reactor = 'reactor',
  synthReactor = 'synthReactor',
  behavior = 'behavior',
  channel = 'channel',
  openChannel = 'openChannel'
}

export type NotSuitableType = '\u26A0 ERROR: NOT SUITABLE TYPE';

interface DescriptorTypeFamilies {
  readonly selectable: [DescriptorType.selector, DescriptorType.paramSelector];
  readonly reactable: [DescriptorType.reactor, DescriptorType.synthReactor];
  readonly emittable: [DescriptorType.channel, DescriptorType.openChannel];
  readonly outerEmittable: [DescriptorType.openChannel];
  readonly observable: [DescriptorType.channel, DescriptorType.openChannel,
    DescriptorType.selector, DescriptorType.paramSelector];
}

export const descriptorTypeFamilies: DescriptorTypeFamilies = {
  selectable: [DescriptorType.selector, DescriptorType.paramSelector],
  reactable: [DescriptorType.reactor, DescriptorType.synthReactor],
  emittable: [DescriptorType.channel, DescriptorType.openChannel],
  outerEmittable: [DescriptorType.openChannel],
  observable: [DescriptorType.channel, DescriptorType.openChannel,
    DescriptorType.selector, DescriptorType.paramSelector]
};
