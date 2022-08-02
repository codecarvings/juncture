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
const createCtxHub = Symbol('createCtxHub');
const createCursor = Symbol('createCursor');
const createPrivateCursor = Symbol('createPrivateCursor');
const adaptHandledValue = Symbol('adaptHandledValue');
const ctx = Symbol('ctx');
const juncture = Symbol('juncture');
const bitDefault = Symbol('bitDefault');

export interface JSymbols {
  readonly defPayload: typeof defPayload;
  readonly handledValue: typeof handledValue;
  readonly createPropertyAssembler: typeof createPropertyAssembler;
  readonly createComposer: typeof createComposer;
  readonly init: typeof init;
  readonly createCtx: typeof createCtx;
  readonly createCtxHub: typeof createCtxHub;
  readonly createCursor: typeof createCursor;
  readonly createPrivateCursor: typeof createPrivateCursor;
  readonly adaptHandledValue: typeof adaptHandledValue;
  readonly ctx: typeof ctx;
  readonly juncture: typeof juncture;
  readonly bitDefault: typeof bitDefault;
}

export const jSymbols: JSymbols = {
  defPayload,
  handledValue,
  createPropertyAssembler,
  createComposer,
  init,
  createCtx,
  createCtxHub,
  createCursor,
  createPrivateCursor,
  adaptHandledValue,
  ctx,
  juncture,
  bitDefault
};
