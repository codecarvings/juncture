/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const payload = Symbol('payload');
const createPropertyAssembler = Symbol('createPropertyAssembler');
const createForger = Symbol('createForger');
const init = Symbol('init');
const createRealm = Symbol('createRealm');
const createCursor = Symbol('createCursor');
const createOuterCursor = Symbol('createOuterCursor');
const realm = Symbol('realm');
const driver = Symbol('driver');
const bitDefault = Symbol('bitDefault');

export interface JSymbols {
  readonly payload: typeof payload;
  readonly createPropertyAssembler: typeof createPropertyAssembler;
  readonly createForger: typeof createForger;
  readonly init: typeof init;
  readonly createRealm: typeof createRealm;
  readonly createCursor: typeof createCursor;
  readonly createOuterCursor: typeof createOuterCursor;
  readonly realm: typeof realm;
  readonly driver: typeof driver;
  readonly bitDefault: typeof bitDefault;
}

export const jSymbols: JSymbols = {
  payload,
  createPropertyAssembler,
  createForger,
  init,
  createRealm,
  createCursor,
  createOuterCursor,
  realm,
  driver,
  bitDefault
};
