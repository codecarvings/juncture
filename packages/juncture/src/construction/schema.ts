/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class JunctureSchema<V = any> {
  constructor(readonly defaultValue: V) { }
}

// ---  Derivations
export type ValueOfSchema<X extends JunctureSchema> = X['defaultValue'];
