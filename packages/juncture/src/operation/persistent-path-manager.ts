/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { arePathEqual, Path, pathFragmentToString, pathToString, PersistentPath } from './path';

interface PersistentPathData {
  readonly path: PersistentPath;
  usageCount: number;
}

export class PersistentPathManager {
  constructor() {
    this.getPersistentPath = this.getPersistentPath.bind(this);
  }

  readonly cache = new Map<string, PersistentPathData[]>();

  protected getPathKey(path: Path): string {
    return path.map(fragment => pathFragmentToString(fragment)).join('/');
  }

  getPersistentPath(path: Path): PersistentPath {
    const key = this.getPathKey(path);
    const datas = this.cache.get(key);
    if (datas !== undefined) {
      for (const data of datas) {
        if (arePathEqual(path, data.path)) {
          return data.path;
        }
      }
    }

    return path as PersistentPath;
  }

  registerRequirement(path: PersistentPath) {
    const key = this.getPathKey(path);

    let data: PersistentPathData | undefined;

    const datas = this.cache.get(key);
    if (datas !== undefined) {
      for (const curData of datas) {
        if (arePathEqual(path, curData.path)) {
          data = curData;
          break;
        }
      }
    }

    if (data) {
      data.usageCount += 1;
    } else {
      data = {
        path,
        usageCount: 1
      };
    }

    if (datas) {
      datas.push(data);
    } else {
      this.cache.set(key, [data]);
    }
  }

  releaseRequirement(path: PersistentPath) {
    const key = this.getPathKey(path);

    const datas = this.cache.get(key);
    if (datas === undefined) {
      throw Error(`Undable to release PersistentPath ${pathToString(path)}: key not found.`);
    }

    let data: PersistentPathData | undefined;
    for (const curData of datas) {
      if (arePathEqual(path, curData.path)) {
        data = curData;
        break;
      }
    }
    if (!data) {
      throw Error(`Undable to release PersistentPath ${pathToString(path)} data not found.`);
    }

    data.usageCount -= 1;
    if (data.usageCount > 0) {
      return;
    }

    if (datas.length > 1) {
      this.cache.set(key, datas.filter(curData => curData !== data));
    } else {
      this.cache.delete(key);
    }
  }
}
