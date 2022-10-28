/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from './access-modifier';
import { Descriptor } from './design/descriptor';
import { DescriptorType, getDescriptorKeyPrefix } from './design/descriptor-type';
import { Driver } from './driver';

const descriptorTypes = {
  dependencies: [DescriptorType.dependency, DescriptorType.optDependency],
  resolvers: [DescriptorType.resolver],
  selectors: [DescriptorType.selector, DescriptorType.paramSelector],
  reactors: [DescriptorType.reactor, DescriptorType.synthReactor],
  channels: [DescriptorType.channel],
  procedures: [DescriptorType.procedure],
  behaviors: [DescriptorType.behavior]
};

interface DescriptorBox {
  readonly map: {
    readonly [key: string]: Descriptor;
  };
  readonly keys: string[];
}

interface PrivatizableDescriptorBox extends DescriptorBox {
  readonly xpKeys: string[];
}

export class Setup {
  readonly dependencies: DescriptorBox;

  readonly resolvers: DescriptorBox;

  readonly selectors: PrivatizableDescriptorBox;

  readonly reactors: PrivatizableDescriptorBox;

  readonly channels: DescriptorBox;

  readonly procedures: PrivatizableDescriptorBox;

  readonly behaviors: DescriptorBox;

  constructor(driver: Driver) {
    const driverKeys = Object.keys(driver);

    this.dependencies = this.createDescriptorBox(driver, driverKeys, descriptorTypes.dependencies);
    this.resolvers = this.createDescriptorBox(driver, driverKeys, descriptorTypes.resolvers);
    this.selectors = this.createPrivatizableDescriptorBox(driver, driverKeys, descriptorTypes.selectors);
    this.reactors = this.createPrivatizableDescriptorBox(driver, driverKeys, descriptorTypes.reactors);
    this.channels = this.createDescriptorBox(driver, driverKeys, descriptorTypes.channels);
    this.procedures = this.createPrivatizableDescriptorBox(driver, driverKeys, descriptorTypes.procedures);
    this.behaviors = this.createDescriptorBox(driver, driverKeys, descriptorTypes.behaviors);
  }

  protected createDescriptorBox(driver: any, driverKeys: string[], types: DescriptorType[]): DescriptorBox {
    const keys: string[] = [];
    const map: any = {};
    this.scanDescriptors(driver, driverKeys, types, (key, descriptor) => {
      map[key] = descriptor;
      keys.push(key);
    });
    return { map, keys };
  }

  // eslint-disable-next-line max-len
  protected createPrivatizableDescriptorBox(driver: any, driverKeys: string[], types: DescriptorType[]): PrivatizableDescriptorBox {
    const keys: string[] = [];
    const map: any = {};
    const xpKeys: string[] = [];
    this.scanDescriptors(driver, driverKeys, types, (key, descriptor) => {
      map[key] = descriptor;
      keys.push(key);
      if (descriptor.access === AccessModifier.public) {
        xpKeys.push(key);
      }
    });
    return { map, keys, xpKeys };
  }

  // eslint-disable-next-line class-methods-use-this
  protected scanDescriptors(
    driver: any,
    driverKeys: string[],
    types: DescriptorType[],
    process: (key: string, descriptor: Descriptor) => void
  ): void {
    const totTypes = types.length;
    const prefixes = types.map(type => `${getDescriptorKeyPrefix(type)}.`);
    driverKeys.forEach(driverKey => {
      const prop = driver[driverKey];
      const index = types.indexOf(prop.type);

      if (index === -1) {
        for (let i = 0; i < totTypes; i += 1) {
          const prefix = prefixes[i];
          const prefixLen = prefix.length;
          if (prefixLen > 1) {
            if (driverKey.length >= prefixLen && driverKey.substring(0, prefixLen) === prefix) {
              const filteredTypes = prefixes
                .map((p, i2) => (p === prefix ? types[i2] : null))
                .filter(s => s !== null) as string[];
              // eslint-disable-next-line max-len
              throw Error(`Invalid prefix "${prefix}": Property "${driverKey}" is not a Descriptor (${filteredTypes.join(', ')}).`);
            }
          }
        }
        return;
      }

      let key = driverKey;
      const prefix = prefixes[index];
      const prefixLen = prefix.length;
      if (prefixLen > 1) {
        if (driverKey.length < prefixLen || driverKey.substring(0, prefixLen) !== prefix) {
          throw Error(`Invalid descriptor key: "${driverKey}": Should start with the prefix "${prefix}".`);
        }
        key = driverKey.substring(prefixLen);
      }

      process(key, prop);
    });
  }
}
