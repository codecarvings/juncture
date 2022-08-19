/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const payload = Symbol('payload');
const eventPicker = Symbol('eventPicker');
const createPropertyAssembler = Symbol('createPropertyAssembler');
const createForger = Symbol('createForger');
const init = Symbol('init');
const createGear = Symbol('createGear');
const createCursor = Symbol('createCursor');
const createInternalCursor = Symbol('createInternalCursor');
const gear = Symbol('gear');
const juncture = Symbol('juncture');
const bitDefault = Symbol('bitDefault');

export interface JSymbols {
  readonly payload: typeof payload;
  readonly eventPicker: typeof eventPicker;
  readonly createPropertyAssembler: typeof createPropertyAssembler;
  readonly createForger: typeof createForger;
  readonly init: typeof init;
  readonly createGear: typeof createGear;
  readonly createCursor: typeof createCursor;
  readonly createInternalCursor: typeof createInternalCursor;
  readonly gear: typeof gear;
  readonly juncture: typeof juncture;
  readonly bitDefault: typeof bitDefault;
}

export const jSymbols: JSymbols = {
  payload,
  eventPicker,
  createPropertyAssembler,
  createForger,
  init,
  createGear,
  createCursor,
  createInternalCursor,
  gear,
  juncture,
  bitDefault
};
