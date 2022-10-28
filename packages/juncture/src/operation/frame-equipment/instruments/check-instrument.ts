/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RealmMountCondition } from '../../realm';
import { getRealm } from '../../realm-host';
import { Cursor } from '../cursor';

export interface UniCheckInstrument {
  <C extends Cursor>(_: C): boolean;
}

export interface UniCheckInstrumentHost {
  readonly check: UniCheckInstrument;
}

// TODO: implement this
export function createUniCheckInstrument(): UniCheckInstrument {
  return (_: Cursor) => getRealm(_).mountCondition === RealmMountCondition.mounted;
}
