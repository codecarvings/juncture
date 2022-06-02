/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { PrivateSelectBin } from '../bin/select-bin';

// --- Symbols
const privateCursorSymbol = Symbol('privateCursor');

interface PrivateCursorSymbols {
  readonly privateCursor: typeof privateCursorSymbol;
}
const privateCursorSymbols: PrivateCursorSymbols = {
  privateCursor: privateCursorSymbol
};

// --- Cursor
export interface PrivateCursorRole {
  readonly [privateCursorSymbols.privateCursor]: true;
}
export interface PrivateCursor<J extends Juncture = any> extends PrivateCursorRole {
  readonly $SELECT: PrivateSelectBin<J>;
}
