/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  arePathEqual, Path, pathFragmentToString, pathToString, PersistentPath
} from '../operation/path';

interface PersistentPathData {
  readonly path: PersistentPath;
  readonly key: string;
  usageCount: number;
}

export class PersistentPathManager {
  constructor() {
    this.getPersistentPath = this.getPersistentPath.bind(this);
    this.registerRequirement = this.registerRequirement.bind(this);
    this.releaseRequirement = this.releaseRequirement.bind(this);
  }

  protected readonly searchableCache = new Map<string, PersistentPathData[]>();

  protected readonly cache = new Map<PersistentPath, PersistentPathData>();

  // eslint-disable-next-line class-methods-use-this
  protected getPathKey(path: Path): string {
    return path.map(fragment => pathFragmentToString(fragment)).join('/');
  }

  getPersistentPath(path: Path): PersistentPath {
    const key = this.getPathKey(path);

    const datas = this.searchableCache.get(key);
    if (datas !== undefined) {
      const totDatas = datas.length;
      for (let i = 0; i < totDatas; i += 0) {
        const data = datas[i];
        if (arePathEqual(path, data.path)) {
          data.usageCount += 1;
          return data.path;
        }
      }
    }

    const data: PersistentPathData = {
      path: path as PersistentPath,
      key,
      usageCount: 1
    };

    if (datas) {
      datas.push(data);
    } else {
      this.searchableCache.set(key, [data]);
      this.cache.set(path as PersistentPath, data);
    }

    return path as PersistentPath;
  }

  registerRequirement(path: PersistentPath) {
    const data = this.cache.get(path);
    if (!data) {
      throw Error(`Unable to register persistent path requirement: path ${pathToString(path)} not found`);
    }
    data.usageCount += 1;
  }

  releaseRequirement(path: PersistentPath) {
    const data = this.cache.get(path);
    if (!data) {
      throw Error(`Unable to release persistent path requirement: path ${pathToString(path)} not found`);
    }

    data.usageCount -= 1;
    if (data.usageCount > 0) {
      return;
    }

    this.cache.delete(path);
    const datas = this.searchableCache.get(data.key)!;
    if (datas.length > 1) {
      this.searchableCache.set(data.key, datas.filter(curData => curData !== data));
    } else {
      this.searchableCache.delete(data.key);
    }
  }
}
