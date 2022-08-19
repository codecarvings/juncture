/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import { AccessModifier } from './access-modifier';
import { Descriptor } from './descriptor';
import { DescriptorType } from './descriptor-type';

// Not a class because of AccessModifier implementation (and because so can be easily expanded...)
export interface DescriptorWithEvents<T extends DescriptorType, P, E, A extends AccessModifier>
  extends Descriptor<T, P, A> {
  readonly [jSymbols.eventPicker]: E;
}
