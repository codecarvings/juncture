/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Gear } from './gear';

export interface Instruction {
  readonly target: Gear;
  readonly key?: string;
  readonly payload: any;
}
