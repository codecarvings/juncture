/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import { DetectInstrument } from '../frame-equipment/instruments/detect-instrument';
import { createSetInstrument, SetInstrument } from '../frame-equipment/instruments/set-instrument';
import { createValueInstrument, ValueInstrument } from '../frame-equipment/instruments/value-instrument';
import { Realm } from '../realm';

// #region InstrumentKit
export interface InstrumentKit<D extends Driver = Driver> {
  readonly value: ValueInstrument<D>;
  readonly set: SetInstrument<D>;
  readonly detect: DetectInstrument<D>;
}

export function prepareInstrumentKit(instruments: any, realm: Realm) {
  defineLazyProperty(instruments, 'value', () => createValueInstrument(realm));
  defineLazyProperty(instruments, 'set', () => createSetInstrument(realm));
}
// #endregion
