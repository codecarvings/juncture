/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { getFilteredDescriptorKeys } from '../design/descriptor';
import { DescriptorType } from '../design/descriptor-type';
import { Reactor } from '../design/descriptors/reactor';
import { Juncture } from '../juncture';
import { jSymbols } from '../symbols';
import { mappedAssign } from '../tool/object';
import { ReactorFrameHost } from './frames/reactor-frame';
import { Gear, GearMountStatus } from './gear';
import { pathToString } from './path';

interface TeardownMap {
  readonly [key: string]: () => void | undefined;
}

const descriptorTypes = [DescriptorType.reactor];

export class ReactorRunner {
  constructor(protected readonly gear: Gear, protected readonly reactorFrameHost: ReactorFrameHost<Juncture>) {
    this.keys = getFilteredDescriptorKeys(gear.juncture, descriptorTypes, true);
  }

  protected readonly keys: string[];

  protected teardowns: TeardownMap | undefined;

  get started(): boolean {
    return this.teardowns !== undefined;
  }

  start() {
    if (this.started) {
      throw Error(`Cannot start reactors of ${pathToString(this.gear.layout.path)}: already started`);
    }

    if (this.gear.mountStatus !== GearMountStatus.mounted) {
      throw Error(`Cannot start reactors of ${pathToString(this.gear.layout.path)}: gear not mouted`);
    }

    this.teardowns = mappedAssign({}, this.keys, key => ((this.gear.juncture as any)[key] as Reactor)[jSymbols.payload](this.reactorFrameHost.reactor));
  }

  stop() {
    if (!this.started) {
      throw Error(`Cannot stop reactors of ${pathToString(this.gear.layout.path)}: not started`);
    }

    this.keys.forEach(key => {
      const teardown = this.teardowns![key];
      if (teardown) {
        teardown();
      }
    });
  }
  // #endregion
}
