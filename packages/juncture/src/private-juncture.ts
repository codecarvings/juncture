/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from './access-modifier';
import { Driver } from './driver';
import {
  AlterableJuncture, Juncture
} from './juncture';

export interface PrivateJunctureAnnex {
  readonly access : AccessModifier.private;
}

export interface PrivateJuncture<D extends Driver = Driver> extends Juncture<D> {
  readonly access: AccessModifier.private;
}

export type Private<J extends Juncture = Juncture> = J & PrivateJunctureAnnex;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export function Private<J extends AlterableJuncture>(juncture: J): Private<J> {
  abstract class PrivateDriver extends juncture {
    static readonly access = AccessModifier.private;
  }
  return PrivateDriver;
}
