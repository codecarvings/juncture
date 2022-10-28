/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { Driver } from '../driver';
import { junctureSymbols } from '../juncture-symbols';
import { mappedAssign } from '../utilities/object';
import { BehaviorFrameHost } from './frames/behavior-frame';
import { pathToString } from './path';
import { Realm, RealmMountCondition } from './realm';

interface TeardownMap {
  readonly [key: string]: () => void | undefined;
}

export class BehaviorSupervisor {
  constructor(protected readonly realm: Realm, protected readonly behaviorFrameHost: BehaviorFrameHost<Driver>) { }

  protected teardowns: TeardownMap | undefined;

  get started(): boolean {
    return this.teardowns !== undefined;
  }

  start() {
    if (this.started) {
      throw Error(`Cannot start behaviors of ${pathToString(this.realm.layout.path)}: Already started.`);
    }

    if (this.realm.mountCondition !== RealmMountCondition.mounted) {
      throw Error(`Cannot start behaviors of ${pathToString(this.realm.layout.path)}: Realm not mouted.`);
    }

    const { keys, map } = this.realm.setup.behaviors;
    this.teardowns = mappedAssign(
      {},
      keys,
      key => map[key][junctureSymbols.payload](this.behaviorFrameHost.behavior)
    );
  }

  stop() {
    if (!this.started) {
      throw Error(`Cannot stop behaviors of ${pathToString(this.realm.layout.path)}: Not started.`);
    }

    const { keys } = this.realm.setup.behaviors;
    keys.forEach(key => {
      const teardown = this.teardowns![key];
      if (teardown) {
        teardown();
      }
    });
  }
  // #endregion
}
