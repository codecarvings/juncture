/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  comparePaths, Path, PathComparisonResult
} from './path';

export class ValueUsageMonitor {
  constructor() {
    this.start = this.start.bind(this);
    this.registerValueUsage = this.registerValueUsage.bind(this);
    this.stop = this.stop.bind(this);
  }

  protected _inProgress = false;

  get inProgress() {
    return this._inProgress;
  }

  protected paths: (Path | null)[] = [];

  start() {
    if (this._inProgress) {
      throw Error('Cannot start new value usage audit: already in progress');
    }
    this._inProgress = true;
  }

  registerValueUsage(newPath: Path) {
    if (!this._inProgress) {
      return;
    }

    const totPaths = this.paths.length;
    let mustAdd = true;

    for (let i = 0; i < totPaths; i += 1) {
      const path = this.paths[i];
      if (path !== null) {
        const comparison = comparePaths(path, newPath);
        if (comparison >= 0) {
          // descendant OR equal
          // no need to add
          mustAdd = false;
          break;
        } else if (comparison === PathComparisonResult.ascendant) {
          // if it's an ascedant, then there is no need the check the (already) added descendant
          this.paths[i] = null;
        }
      }
    }

    if (mustAdd) {
      this.paths.push(newPath);
    }
  }

  stop(): Path[] {
    if (!this._inProgress) {
      throw Error('Cannot stop value usage audit: not started');
    }
    this._inProgress = false;

    const result = this.paths.filter(path => path !== null) as Path[];
    this.paths.length = 0;
    return result;
  }
}
