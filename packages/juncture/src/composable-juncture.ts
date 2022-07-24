/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Composer } from './composer';
import { Juncture } from './juncture';
import { jSymbols } from './symbols';

// Important: Required to prevent circular references (eg with ValueOf<this>)
export abstract class ComposableJuncture extends Juncture {
  protected [jSymbols.createComposer](): Composer<this> {
    return new Composer<this>(Juncture.getPropertyAssembler(this));
  }

  protected readonly DEF: Composer<this> = this[jSymbols.createComposer]();
}
