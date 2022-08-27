/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Gear } from './gear';
import { pathToString } from './path';

export class TransactionManager {
  constructor(protected readonly syncGears: () => void) {
    this.begin = this.begin.bind(this);
    this.registerAlteredGear = this.registerAlteredGear.bind(this);
    this.commit = this.commit.bind(this);
  }

  protected _inProgress = false;

  get inProgress() {
    return this._inProgress;
  }

  protected alteredGears = new Map<Gear, any>();

  protected completedGears = new Set<Gear>();

  begin() {
    if (this._inProgress) {
      throw Error('Cannot begin new transaction: already in progress');
    }
    this._inProgress = true;
  }

  registerAlteredGear(gear: Gear) {
    if (!this._inProgress) {
      // eslint-disable-next-line max-len
      throw Error(`Cannot register altered gear ${pathToString(gear.layout.path)} for transaction: no transaction in progress`);
    }

    if (!this.alteredGears.has(gear)) {
      this.alteredGears.set(gear, gear.value);
    }
  }

  commit() {
    if (!this._inProgress) {
      throw Error('Cannot commit transaction: no transaction in progress');
    }

    const { completedGears } = this;
    const iterateGear = (gear: Gear) => {
      if (!completedGears.has(gear)) {
        completedGears.add(gear);

        // TODO: manage value change

        if (gear.layout.parent) {
          iterateGear(gear.layout.parent);
        }
      }
    };

    this.alteredGears.forEach((initialValue, gear) => {
      if (gear.value !== initialValue) {
        iterateGear(gear);
      }
    });

    completedGears.clear();
    this.alteredGears.clear();
    this._inProgress = false;

    this.syncGears();
  }
}
