/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, ValueOfJuncture } from '../juncture';
import { Cursor } from '../operation/frame-equipment/cursor';
import { Path } from '../operation/path';

export interface DynamicQueryJunctureRequest<J extends Juncture = Juncture> {
  readonly juncture: J;
  readonly parent?: string | Path | Cursor;
  readonly optional?: boolean;

  // Extra DynamicQueryTemporaryJunctureRequest properties required in order to make type inference work
  readonly temporaryJuncture?: undefined;
  readonly branchKey?: undefined;
  readonly initialValue?: undefined;
}

export interface DynamicQueryTemporaryJunctureRequest<J extends Juncture = Juncture> {
  readonly temporaryJuncture: J;
  readonly branchKey?: string;
  readonly initialValue?: ValueOfJuncture<J>

  // Extra DynamicQueryJunctureRequest properties required in order to make type inference work
  readonly juncture?: undefined;
  readonly parent?: undefined;
  readonly optional?: undefined;
}

export type DynamicQueryItem = Juncture | DynamicQueryJunctureRequest | DynamicQueryTemporaryJunctureRequest;

export type DynamicQuery = {
  readonly [key in keyof any]: DynamicQueryItem;
};
