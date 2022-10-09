/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Cursor, isCursor } from '../operation/frame-equipment/cursor';
import { Path } from '../operation/path';

export type QuerySource = string | Path | Cursor;

export function isQuerySource(obj: any): obj is QuerySource {
  if (typeof obj === 'string') {
    return true;
  }
  if (Array.isArray(obj)) {
    return true;
  }
  if (isCursor(obj)) {
    return true;
  }
  return false;
}

export enum QuerySourceType {
  branchKey = 'branchKey',
  path = 'path',
  cursor = 'cursor'
}

export function getQuerySourceType(source: QuerySource): QuerySourceType {
  if (typeof source === 'string') {
    return QuerySourceType.branchKey;
  }
  if (Array.isArray(source)) {
    return QuerySourceType.path;
  }
  if (isCursor(source)) {
    return QuerySourceType.cursor;
  }

  throw Error('Cannot detect type of QuerySource');
}
