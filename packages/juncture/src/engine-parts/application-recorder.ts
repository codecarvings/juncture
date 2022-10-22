/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PersistentPath } from '../operation/path';

export type ApplicationCassette = Set<PersistentPath>;

// ApplicationRecorder
export class ApplicationRecorder {
  constructor() {
    this.insertCassette = this.insertCassette.bind(this);
    this.ejectCassette = this.ejectCassette.bind(this);
    this.registerValueApplication = this.registerValueApplication.bind(this);
  }

  protected currentCassette: ApplicationCassette | null = null;

  insertCassette(cassette: ApplicationCassette) {
    if (this.currentCassette) {
      throw Error('Cannot insert application cassette: another cassette already present.');
    }
    this.currentCassette = cassette;
  }

  ejectCassette() {
    if (!this.currentCassette) {
      throw Error('Cannot eject application cassette: no cassette present.');
    }

    this.currentCassette = null;
  }

  registerValueApplication(path: PersistentPath) {
    if (!this.currentCassette) {
      return;
    }

    this.currentCassette!.add(path);
  }
}
