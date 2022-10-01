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
  readonly parent?: string | Path | Cursor;
  readonly optional?: boolean;
}

export type QueryItem = Juncture | QueryJunctureRequest;

export interface Query {
  readonly [key: string]: QueryItem;
}
