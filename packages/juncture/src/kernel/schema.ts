/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import { createDefinition, Definition, DefinitionKind } from './definition';

// #region Schema
export abstract class Schema<V extends HV = any, HV = V> {
  // TYPE PLACEHOLDER: Return type of a readucer(for an object juncture can be Partial...)
  readonly [jSymbols.handledValue]!: HV;

  // Constructor is protected to allow safe Juncture inheritance
  protected constructor(readonly defaultValue: V) { }
}
// #endregion

// #region Definition
export type SchemaDefinition<X extends Schema> = Definition<DefinitionKind.schema, () => X>;

export function createSchemaDefinition<X extends Schema>(schemaFactory: () => X): SchemaDefinition<X> {
  return createDefinition(DefinitionKind.schema, schemaFactory);
}

// ---  Derivations
export type SchemaOfDefinition<D> = D extends SchemaDefinition<infer X> ? X : never;
// #endregion
