/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createDef, Def, DefAccess, DefType
} from './def';

// #region Schema
export class Schema<V = any> {
  constructor(readonly defaultValue: V) { }
}

// ---  Derivations
export type ValueOfSchema<X extends Schema> = X['defaultValue'];
// #endregion

// #region Def
export type SchemaDef<B extends Schema> = Def<DefType.schema, () => B, DefAccess.public>;

export function createSchemaDef<B extends Schema>(schemaFactory: () => B): SchemaDef<B> {
  return createDef(DefType.schema, schemaFactory, DefAccess.public);
}

// ---  Derivations
export type SchemaOfSchemaDef<D extends SchemaDef<Schema>> =
  D extends SchemaDef<infer B> ? B : never;
// #endregion
