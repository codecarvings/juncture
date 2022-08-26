/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from './driver';
import { Forger } from './forger';
import { jSymbols } from './symbols';

// Important: Required to prevent circular references (eg with ValueOf<this>)
export abstract class ForgeableDriver extends Driver {
  protected [jSymbols.createForger](): Forger<this> {
    return new Forger<this>(this);
  }

  protected readonly FORGE: Forger<this> = this[jSymbols.createForger]();
}
