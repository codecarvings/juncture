/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOf, Driver } from '../../../driver';
import { EmitBin, EmitBinHost } from '../../bins/emit-bin';
import { Realm } from '../../realm';
import { createInnerPickerFactory } from '../picker';

export interface EmitPicker<D extends Driver> {
  (): EmitBin<D>;
  (_: CursorOf<D>): EmitBin<D>;
}

export const createEmitPicker: <D extends Driver>(
  defaultRealm: Realm,
  emitBinHost: EmitBinHost<D>
) => EmitPicker<D> = createInnerPickerFactory('emit');
