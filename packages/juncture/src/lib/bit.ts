/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefComposer } from '../definition/composer';
import { createSchemaDef, Schema } from '../definition/schema';
import { Juncture } from '../juncture';
import { jSymbols } from '../symbols';

// #region Value & Schema
let createBitSchema: <V>(defaultValue: V) => BitSchema<V>;
export class BitSchema<V = any> extends Schema<V> {
  // Initialization without static block
  static #staticInit = (() => {
    createBitSchema = <V2>(defaultValue: V2) => new BitSchema<V2>(defaultValue);
  })();
}
// #endregion

// #region Composer
export class BitDefComposer<J extends Bit> extends DefComposer<J> {
  protected createOverrideMannequin() {
    return {
      ...super.createOverrideMannequin()
    };
  }

  readonly override!: DefComposer<J>['override'] & {
    <D extends BitSchema<any>>(parent: D): 'BIT SCHEMA';
  };
}
// #endregion

// #region Juncture
export abstract class Bit extends Juncture {
  // abstract schema: SchemaDef<BitSchema>;
  schema = createSchemaDef(() => createBitSchema('TODO'));

  protected [jSymbols.createDefComposer]() {
    return new BitDefComposer(this);
  }

  protected readonly DEF!: BitDefComposer<this>;
}
// #endregion
