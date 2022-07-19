/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const defPayload = Symbol('defPayload');
const handledValue = Symbol('handledValue');
const createPropertyAssembler = Symbol('createPropertyAssembler');
const createDefComposer = Symbol('createDefComposer');
const createDriver = Symbol('createDriver');
const createFrame = Symbol('createFrame');
const bitDefault = Symbol('bitDefault');

export interface JSymbols {
  readonly defPayload: typeof defPayload;
  readonly handledValue: typeof handledValue;
  readonly createPropertyAssembler: typeof createPropertyAssembler;
  readonly createDefComposer: typeof createDefComposer;
  readonly createDriver: typeof createDriver;
  readonly createFrame: typeof createFrame;
  readonly bitDefault: typeof bitDefault;
}

export const jSymbols: JSymbols = {
  defPayload,
  handledValue,
  createPropertyAssembler,
  createDefComposer,
  createDriver,
  createFrame,
  bitDefault
};
