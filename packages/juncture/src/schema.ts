/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from './access-modifier';
import { Juncture } from './juncture';

export class JunctureSchema<V = any> {
  constructor(readonly defaultValue: V) { }
}

// ---  Derivations
export type ValueOfSchema<X extends JunctureSchema> = X['defaultValue'];

export class SingleChildSchema<J extends Juncture, V> extends JunctureSchema<V> {
  constructor(readonly child: J, defaultValue: V) {
    super(defaultValue);
    switch ((child as any).access) {
      case AccessModifier.private:
        this.childAccess = AccessModifier.private;
        break;
      default:
        this.childAccess = AccessModifier.public;
        break;
    }
  }

  readonly childAccess: AccessModifier;
}
