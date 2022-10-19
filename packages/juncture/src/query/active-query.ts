/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isJuncture, Juncture, ValueOfJuncture } from '../juncture';
import { isObject } from '../utilities/object';
import { isQuerySource, QuerySource } from './query-source';

export interface ActiveQueryRequest<J extends Juncture = Juncture> {
  readonly get: J;
  readonly from?: QuerySource;
  readonly optional?: boolean;

  // Extra properties required in order to make type inference work
  readonly run?: undefined;
  readonly branchId?: undefined;
  readonly initialValue?: undefined;
}

export function isActiveQueryRequest(obj: any): obj is ActiveQueryRequest {
  if (!isObject(obj)) {
    return false;
  }
  if (!isJuncture(obj.get)) {
    return false;
  }

  return true;
}

export interface ActiveQueryExplicitRequest {
  readonly get: QuerySource;

  // Extra properties required in order to make type inference work
  readonly from?: undefined;
  readonly optional?: undefined;
  readonly run?: undefined;
  readonly branchId?: undefined;
  readonly initialValue?: undefined;
}

export function isActiveQueryExplicitRequest(obj: any): obj is ActiveQueryExplicitRequest {
  if (!isObject(obj)) {
    return false;
  }
  if (!isQuerySource(obj.get)) {
    return false;
  }

  return true;
}

export interface ActiveQueryRunRequest<J extends Juncture = Juncture> {
  readonly run: J;
  readonly branchId?: string;
  readonly initialValue?: ValueOfJuncture<J>

  // Extra properties required in order to make type inference work
  readonly get?: undefined;
  readonly from?: undefined;
  readonly optional?: undefined;
}

export function isActiveQueryRunRequest(obj: any): obj is ActiveQueryRunRequest {
  if (!isObject(obj)) {
    return false;
  }
  if (!isJuncture(obj.run)) {
    return false;
  }

  return true;
}

export type ActiveQueryItem = Juncture | ActiveQueryRequest | ActiveQueryExplicitRequest | ActiveQueryRunRequest;

export interface ActiveQuery {
  readonly [key: string]: ActiveQueryItem;
}
