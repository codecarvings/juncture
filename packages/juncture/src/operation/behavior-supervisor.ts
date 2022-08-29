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
import { Behavior } from '../design/descriptors/behavior';
import { Driver } from '../driver';
import { jSymbols } from '../symbols';
import { mappedAssign } from '../tool/object';
import { BehaviorFrameHost } from './frames/behavior-frame';
import { pathToString } from './path';
import { Realm, RealmMountStatus } from './realm';

interface TeardownMap {
  readonly [key: string]: () => void | undefined;
}

const descriptorTypes = [DescriptorType.behavior];

export class BehaviorHandler {
  constructor(protected readonly realm: Realm, protected readonly behaviorFrameHost: BehaviorFrameHost<Driver>) {
    this.keys = getFilteredDescriptorKeys(realm.driver, descriptorTypes, true);
  }

  protected readonly keys: string[];

  protected teardowns: TeardownMap | undefined;

  get started(): boolean {
    return this.teardowns !== undefined;
  }

  start() {
    if (this.started) {
      throw Error(`Cannot start behaviors of ${pathToString(this.realm.layout.path)}: already started`);
    }

    if (this.realm.mountStatus !== RealmMountStatus.mounted) {
      throw Error(`Cannot start behaviors of ${pathToString(this.realm.layout.path)}: realm not mouted`);
    }

    this.teardowns = mappedAssign({}, this.keys, key => ((this.realm.driver as any)[key] as Behavior)[jSymbols.payload](this.behaviorFrameHost.behavior));
  }

  stop() {
    if (!this.started) {
      throw Error(`Cannot stop behaviors of ${pathToString(this.realm.layout.path)}: not started`);
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
