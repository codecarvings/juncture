/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import {
  createDef, Def, DefKind, isDef
} from './def';

// #region Schema
// Handled value: Return type of a readucer
// Required for inheritance of object-type junctures (eg: Struct)
export class Schema<V extends HV = any, HV = V> {
  readonly [jSymbols.handledValue]!: HV; // Preserve type param

  constructor(readonly defaultValue: V) { }
}

// ---  Derivations
export type ValueOfSchema<X extends Schema> = X['defaultValue'];
// #endregion

// #region Def
export type SchemaDef<B extends Schema> = Def<DefKind.schema, '', () => B>;

export function createSchemaDef<B extends Schema>(schemaFactory: () => B): SchemaDef<B> {
  return createDef(DefKind.schema, '', schemaFactory);
}

export function isSchemaDef(obj: any): obj is SchemaDef<Schema> {
  return isDef(obj, DefKind.schema, '');
}

// ---  Derivations
export type SchemaOfSchemaDef<D extends SchemaDef<Schema>> =
  D extends SchemaDef<infer B> ? B : never;
// #endregion
