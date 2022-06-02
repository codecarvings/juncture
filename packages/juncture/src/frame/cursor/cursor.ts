/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { SelectBin } from '../bin/select-bin';

export interface Cursor<J extends Juncture = any> {
  readonly $SELECT: SelectBin<J>;
}
