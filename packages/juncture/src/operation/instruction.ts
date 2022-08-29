/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Realm } from './realm';

export interface Instruction {
  readonly target: Realm;
  readonly key?: string;
  readonly payload: any;
}
