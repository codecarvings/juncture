/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Schema, SchemaDef } from '../definition/schema';
import { Juncture } from '../juncture';

// #region Value & Schema
let createBitSchema: <V>(defaultValue: V) => BitSchema<V>;
export class BitSchema<V = any> extends Schema<V> {
  // Initialization without static block
  static #staticInit = (() => {
    createBitSchema = <V2>(defaultValue: V2) => new BitSchema<V2>(defaultValue);
  })();
}
// #endregion

// #region Juncture
export abstract class Bit extends Juncture {
  abstract schema: SchemaDef<BitSchema>;
}
// #endregion
