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
export class Schema<V extends HV = any, HV = V> {
  // TYPE PLACEHOLDER: Return type of a readucer(for an object juncture can be Partial...)
  readonly [jSymbols.handledValue]!: HV;

  constructor(readonly defaultValue: V) { }
}
// #endregion

// #region Def
export type SchemaDef<B extends Schema> = Def<DefKind.schema, '', () => B>;

export function createSchemaDef<B extends Schema>(schemaFactory: () => B): SchemaDef<B> {
  return createDef(DefKind.schema, '', schemaFactory);
}

export function isSchemaDef(obj: any): obj is SchemaDef<any> {
  return isDef(obj, DefKind.schema, '');
}

// ---  Derivations
export type SchemaOfSchemaDef<D extends SchemaDef<any>> = D extends SchemaDef<infer X> ? X : never;
// #endregion
