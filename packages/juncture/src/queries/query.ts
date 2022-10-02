/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../juncture';
import { Cursor } from '../operation/frame-equipment/cursor';
import { Path } from '../operation/path';

export interface QueryJunctureRequest<J extends Juncture = Juncture> {
  readonly juncture: J;
  readonly source?: string | Path | Cursor;
  readonly optional?: boolean;
}

export interface QueryExplicitRequest {
  readonly source: string | Path | Cursor;

  // Extra QueryJunctureRequest properties required in order to make type inference work
  readonly juncture?: undefined;
  readonly optional?: undefined;
}

export type QueryItem = Juncture | QueryJunctureRequest | QueryExplicitRequest;

export interface Query {
  readonly [key: string]: QueryItem;
}

export enum QueryItemSourceType {
  string = 'string',
  path = 'path',
  cursor = 'cursor'
}

export function getQueryItemSourceType(source: string | Path | Cursor): QueryItemSourceType {
  if (typeof source === 'string') {
    return QueryItemSourceType.string;
  }
  if (Array.isArray(source)) {
    return QueryItemSourceType.path;
  }
  return QueryItemSourceType.cursor;
}
