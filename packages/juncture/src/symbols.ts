/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const defPayload = Symbol('defPayload');
const createPropertyAssembler = Symbol('createPropertyAssembler');
const createComposer = Symbol('createComposer');
const init = Symbol('init');
const createCtx = Symbol('createCtx');
const createCursor = Symbol('createCursor');
const createInternalCursor = Symbol('createInternalCursor');
const ctx = Symbol('ctx');
const juncture = Symbol('juncture');
const bitDefault = Symbol('bitDefault');

export interface JSymbols {
  readonly defPayload: typeof defPayload;
  readonly createPropertyAssembler: typeof createPropertyAssembler;
  readonly createComposer: typeof createComposer;
  readonly init: typeof init;
  readonly createCtx: typeof createCtx;
  readonly createCursor: typeof createCursor;
  readonly createInternalCursor: typeof createInternalCursor;
  readonly ctx: typeof ctx;
  readonly juncture: typeof juncture;
  readonly bitDefault: typeof bitDefault;
}

export const jSymbols: JSymbols = {
  defPayload,
  createPropertyAssembler,
  createComposer,
  init,
  createCtx,
  createCursor,
  createInternalCursor,
  ctx,
  juncture,
  bitDefault
};
