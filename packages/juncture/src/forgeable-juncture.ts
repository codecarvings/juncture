/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Forger } from './construction/forger';
import { Juncture } from './juncture';
import { jSymbols } from './symbols';

// Important: Required to prevent circular references (eg with ValueOf<this>)
export abstract class ForgeableJuncture extends Juncture {
  protected [jSymbols.createForger](): Forger<this> {
    return new Forger<this>(Juncture.getPropertyAssembler(this));
  }

  protected readonly FORGE: Forger<this> = this[jSymbols.createForger]();
}
