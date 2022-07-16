/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SchemaDef, SchemaOfSchemaDef } from './definition/schema';
import { JSymbols } from './symbols';

// Important: Required to prevent circular references (eg with ValueOf<this>)
export interface SchemaHost {
  readonly schema: SchemaDef<any>;
}

export interface SchemaHostType<H extends SchemaHost = SchemaHost> {
  new(): H
}

export type SchemaOf<J extends SchemaHost> = SchemaOfSchemaDef<J['schema']>;
export type ValueOf<J extends SchemaHost> = SchemaOfSchemaDef<J['schema']>['defaultValue'];
export type HandledValueOf<J extends SchemaHost> = SchemaOfSchemaDef<J['schema']>[JSymbols['handledValue']];

export type SchemaOfType<JT extends SchemaHostType> = SchemaOf<InstanceType<JT>>;
export type ValueOfType<JT extends SchemaHostType> = ValueOf<InstanceType<JT>>;
export type HandledValueOfType<JT extends SchemaHostType> = HandledValueOf<InstanceType<JT>>;
