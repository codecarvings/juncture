/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from './driver';
import {
  AlterableJuncture, Juncture, JunctureMap, OuterCursorOfJuncture
} from './juncture';

export enum AccessModifier {
  public = 'public',
  private = 'private'
}

// #region name Private
export interface PrivateJunctureAnnex {
  readonly access : AccessModifier.private;
}

export interface PrivateJuncture<D extends Driver = Driver> extends Juncture<D> {
  readonly access: AccessModifier.private;
}

export type Private<J extends Juncture = Juncture> = J & PrivateJunctureAnnex;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export function Private<J extends AlterableJuncture>(Juncture: J): Private<J> {
  abstract class PrivateDriver extends Juncture {
    static readonly access = AccessModifier.private;
  }
  return PrivateDriver;
}
// #endregion

// #region Outer
export type OuterCursorMapOfJunctureMap<JM extends JunctureMap> = {
  readonly [K in keyof JM as JM[K] extends PrivateJunctureAnnex ? never : K]: OuterCursorOfJuncture<JM[K]>;
};
// #endregion
