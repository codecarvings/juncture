/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseDriver } from './base-driver';
import { Forger } from './forger';
import { junctureSymbols } from './juncture-symbols';

// Important: Required to prevent circular references (eg with ValueOf<this>)
export abstract class ForgeableDriver extends BaseDriver {
  protected [junctureSymbols.createForger](): Forger<this> {
    return new Forger<this>(this);
  }

  protected readonly FORGE: Forger<this> = this[junctureSymbols.createForger]();
}
