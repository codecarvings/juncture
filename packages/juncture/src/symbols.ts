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
const createComposer = Symbol('createComposer');
const init = Symbol('init');
const createCtx = Symbol('createCtx');
const bitDefault = Symbol('bitDefault');

export interface JSymbols {
  readonly defPayload: typeof defPayload;
  readonly handledValue: typeof handledValue;
  readonly createPropertyAssembler: typeof createPropertyAssembler;
  readonly createComposer: typeof createComposer;
  readonly init: typeof init;
  readonly createCtx: typeof createCtx;
  readonly bitDefault: typeof bitDefault;
}

export const jSymbols: JSymbols = {
  defPayload,
  handledValue,
  createPropertyAssembler,
  createComposer,
  init,
  createCtx,
  bitDefault
};
