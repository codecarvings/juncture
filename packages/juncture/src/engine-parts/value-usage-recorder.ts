/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PersistentPath } from '../operation/path';

export type ValueUsageCassette = Set<PersistentPath>;

export class ValueUsageRecorder {
  constructor() {
    this.useCassette = this.useCassette.bind(this);
    this.ejectCassette = this.ejectCassette.bind(this);
    this.registerValueUsage = this.registerValueUsage.bind(this);
  }

  protected currentCassette: ValueUsageCassette | null = null;

  useCassette(cassette: ValueUsageCassette) {
    if (this.currentCassette) {
      throw Error('Cannot use cassette: another cassette already present.');
    }
    this.currentCassette = cassette;
  }

  ejectCassette() {
    if (!this.currentCassette) {
      throw Error('Cannot eject cassette: no cassette present.');
    }

    this.currentCassette = null;
  }

  registerValueUsage(path: PersistentPath) {
    if (!this.currentCassette) {
      return;
    }

    this.currentCassette!.add(path);
  }
}
