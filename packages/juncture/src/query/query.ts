/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../juncture';
import { QuerySource } from './query-source';

export interface QueryRequest<J extends Juncture = Juncture> {
  readonly take: J;
  readonly from?: QuerySource;
  readonly optional?: boolean;
}

export interface QueryExplicitRequest {
  readonly take: QuerySource;

  // Extra properties required in order to make type inference work
  readonly from?: undefined;
  readonly optional?: undefined;
}

export type QueryItem = Juncture | QueryRequest | QueryExplicitRequest;

export interface Query {
  readonly [key: string]: QueryItem;
}
