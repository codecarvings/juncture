/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Schema, SchemaDef, SchemaOfSchemaDef } from './definition/schema';
import { Frame, FrameConfig } from './frame/frame';
import { JSymbols, jSymbols } from './symbols';

// Important: Required to prevent circular references (eg with ValueOf<this>)
export interface BareJuncture {
  readonly schema: SchemaDef<Schema>;

  [jSymbols.createFrame](config: FrameConfig): Frame<this>;
}

// ---  Derivations
export type SchemaOf<J extends BareJuncture> = SchemaOfSchemaDef<J['schema']>;
export type ValueOf<J extends BareJuncture> = SchemaOfSchemaDef<J['schema']>['defaultValue'];
export type HandledValueOf<J extends BareJuncture> = SchemaOfSchemaDef<J['schema']>[JSymbols['handledValue']];

export type FrameOf<J extends BareJuncture> = ReturnType<J[typeof jSymbols.createFrame]>;
export type PrivateCursorOf<J extends BareJuncture> = ReturnType<J[typeof jSymbols.createFrame]>['privateCursor'];
export type CursorOf<J extends BareJuncture> = ReturnType<J[typeof jSymbols.createFrame]>['cursor'];
// #endregion

// #region JunctureType
export interface BareJunctureType<J extends BareJuncture = BareJuncture> {
  new(): J;
}

// ---  Derivations
export type SchemaOfType<JT extends BareJunctureType> = SchemaOf<InstanceType<JT>>;
export type ValueOfType<JT extends BareJunctureType> = ValueOf<InstanceType<JT>>;
export type HandledValueOfType<JT extends BareJunctureType> = HandledValueOf<InstanceType<JT>>;

export type FrameOfType<JT extends BareJunctureType> = FrameOf<InstanceType<JT>>;
export type PrivateCursorOfType<JT extends BareJunctureType> = PrivateCursorOf<InstanceType<JT>>;
export type CursorOfType<JT extends BareJunctureType> = CursorOf<InstanceType<JT>>;
// #endregion
