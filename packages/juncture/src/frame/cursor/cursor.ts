/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, ValueOf } from '../../juncture';
import { DispatchBin } from '../bin/dispatch-bin';
import { SelectBin } from '../bin/select-bin';

export interface Cursor<J extends Juncture> {
  readonly $VALUE: ValueOf<J>;
  readonly $SELECT: SelectBin<J>;
  readonly $DISPATCH: DispatchBin<J>;
}
