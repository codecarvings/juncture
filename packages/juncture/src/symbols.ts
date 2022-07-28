/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const typeParam1 = Symbol('typeParam1');
const defPayload = Symbol('defPayload');
const handledValue = Symbol('handledValue');
const createPropertyAssembler = Symbol('createPropertyAssembler');
const createComposer = Symbol('createComposer');
const init = Symbol('init');
const createCtx = Symbol('createCtx');
const createCtxHub = Symbol('createCtxHub');
const createCursor = Symbol('createCursor');
const createPrivateCursor = Symbol('createPrivateCursor');
const bitDefault = Symbol('bitDefault');

export interface JSymbols {
  readonly typeParam1: typeof typeParam1;
  readonly defPayload: typeof defPayload;
  readonly handledValue: typeof handledValue;
  readonly createPropertyAssembler: typeof createPropertyAssembler;
  readonly createComposer: typeof createComposer;
  readonly init: typeof init;
  readonly createCtx: typeof createCtx;
  readonly createCtxHub: typeof createCtxHub;
  readonly createCursor: typeof createCursor;
  readonly createPrivateCursor: typeof createPrivateCursor;
  readonly bitDefault: typeof bitDefault;
}

export const jSymbols: JSymbols = {
  typeParam1,
  defPayload,
  handledValue,
  createPropertyAssembler,
  createComposer,
  init,
  createCtx,
  createCtxHub,
  createCursor,
  createPrivateCursor,
  bitDefault
};
