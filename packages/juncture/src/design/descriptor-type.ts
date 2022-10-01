/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export enum DescriptorType {
  schema = 'schema',
  dependency = 'dependency',
  optDependency = 'optDependency',
  resolver = 'resolver',
  selector = 'selector',
  paramSelector = 'paramSelector',
  reactor = 'reactor',
  synthReactor = 'synthReactor',
  channel = 'channel',
  procedure = 'procedure',
  behavior = 'behavior'
}

export enum DescriptorKeyPrefix {
  schema = '',
  dependency = 'dependency',
  resolver = 'resolver',
  selector = 'selector',
  reactor = 'reactor',
  channel = 'channel',
  procedure = 'procedure',
  behavior = 'behavior'
}

export function getDescriptorKeyPrefix(type: DescriptorType) {
  switch (type) {
    case DescriptorType.schema:
      return DescriptorKeyPrefix.schema;
    case DescriptorType.dependency:
    case DescriptorType.optDependency:
      return DescriptorKeyPrefix.dependency;
    case DescriptorType.resolver:
      return DescriptorKeyPrefix.resolver;
    case DescriptorType.selector:
    case DescriptorType.paramSelector:
      return DescriptorKeyPrefix.selector;
    case DescriptorType.reactor:
    case DescriptorType.synthReactor:
      return DescriptorKeyPrefix.reactor;
    case DescriptorType.channel:
      return DescriptorKeyPrefix.channel;
    case DescriptorType.procedure:
      return DescriptorKeyPrefix.procedure;
    case DescriptorType.behavior:
      return DescriptorKeyPrefix.behavior;
    default:
      throw Error(`Unable to find prefix for DescriptorType '${type}'`);
  }
}
