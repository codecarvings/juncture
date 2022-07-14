/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const defPayload = Symbol('defPayload');
const handledValue = Symbol('handledValue');
const propertyAssembler = Symbol('propertyAssembler');
const createDefComposer = Symbol('createDefComposer');
const createDriver = Symbol('createDriver');
const createFrame = Symbol('createFrame');
const bitDefault = Symbol('bitDefault');

export interface JSymbols {
  readonly defPayload: typeof defPayload;
  readonly handledValue: typeof handledValue;
  readonly propertyAssembler: typeof propertyAssembler;
  readonly createDefComposer: typeof createDefComposer;
  readonly createDriver: typeof createDriver;
  readonly createFrame: typeof createFrame;
  readonly bitDefault: typeof bitDefault;
}

export const jSymbols: JSymbols = {
  defPayload,
  handledValue,
  propertyAssembler,
  createDefComposer,
  createDriver,
  createFrame,
  bitDefault
};
