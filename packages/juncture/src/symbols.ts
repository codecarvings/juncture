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
const createGear = Symbol('createGear');
const createCursor = Symbol('createCursor');
const createOuterCursor = Symbol('createOuterCursor');
const gear = Symbol('gear');
const driver = Symbol('driver');
const bitDefault = Symbol('bitDefault');

export interface JSymbols {
  readonly payload: typeof payload;
  readonly createPropertyAssembler: typeof createPropertyAssembler;
  readonly createForger: typeof createForger;
  readonly init: typeof init;
  readonly createGear: typeof createGear;
  readonly createCursor: typeof createCursor;
  readonly createOuterCursor: typeof createOuterCursor;
  readonly gear: typeof gear;
  readonly driver: typeof driver;
  readonly bitDefault: typeof bitDefault;
}

export const jSymbols: JSymbols = {
  payload,
  createPropertyAssembler,
  createForger,
  init,
  createGear,
  createCursor,
  createOuterCursor,
  gear,
  driver,
  bitDefault
};
