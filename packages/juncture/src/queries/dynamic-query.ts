/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isJuncture, Juncture, ValueOfJuncture } from '../juncture';
import { Cursor } from '../operation/frame-equipment/cursor';
import { Path } from '../operation/path';
import { isObject } from '../utilities/object';

export interface DynamicQueryJunctureRequest<J extends Juncture = Juncture> {
  readonly juncture: J;
  readonly source?: string | Path | Cursor;
  readonly optional?: boolean;

  // Extra DynamicQueryTemporaryJunctureRequest properties required in order to make type inference work
  readonly temporaryJuncture?: undefined;
  readonly branchKey?: undefined;
  readonly initialValue?: undefined;
}

export function isDynamicQueryJunctureRequest(obj: any): obj is DynamicQueryJunctureRequest {
  if (!isObject(obj)) {
    return false;
  }
  if (!isJuncture(obj.juncture)) {
    return false;
  }

  return true;
}

export interface DynamicQueryTemporaryJunctureRequest<J extends Juncture = Juncture> {
  readonly temporaryJuncture: J;
  readonly branchKey?: string;
  readonly initialValue?: ValueOfJuncture<J>

  // Extra DynamicQueryJunctureRequest properties required in order to make type inference work
  readonly juncture?: undefined;
  readonly source?: undefined;
  readonly optional?: undefined;
}

export function isDynamicQueryTemporaryJunctureRequest(obj: any): obj is DynamicQueryTemporaryJunctureRequest {
  if (!isObject(obj)) {
    return false;
  }
  if (!isJuncture(obj.temporaryJuncture)) {
    return false;
  }

  return true;
}

export type DynamicQueryItem = Juncture | DynamicQueryJunctureRequest | DynamicQueryTemporaryJunctureRequest;

export interface DynamicQuery {
  readonly [key: string]: DynamicQueryItem;
}

export enum DynamicQueryItemType {
  juncture = 'juncture',
  junctureRequest = 'junctureRequest',
  temporaryJunctureRequest = 'temporaryJunctureRequest'
}

export function getDynamicQueryItemType(item: DynamicQueryItem): DynamicQueryItemType {
  // In frequency order
  if (isJuncture(item)) {
    return DynamicQueryItemType.juncture;
  }
  if (isDynamicQueryTemporaryJunctureRequest(item)) {
    return DynamicQueryItemType.temporaryJunctureRequest;
  }
  if (isDynamicQueryJunctureRequest(item)) {
    return DynamicQueryItemType.junctureRequest;
  }

  throw Error('Cannot detect type of DynamicQueryItem');
}
