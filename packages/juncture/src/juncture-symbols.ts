/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const init = Symbol('init');
const createPropertyAssembler = Symbol('createPropertyAssembler');
const juncture = Symbol('juncture');
const payload = Symbol('payload');
const createForger = Symbol('createForger');
const createSetup = Symbol('createSetup');
const createRealm = Symbol('createRealm');
const createCursor = Symbol('createCursor');
const createXpCursor = Symbol('createXpCursor');
const realm = Symbol('realm');
const driver = Symbol('driver');
const persistent = Symbol('persistent');
const bitDefault = Symbol('bitDefault');

export interface JunctureSymbols {
  readonly init: typeof init;
  readonly createPropertyAssembler: typeof createPropertyAssembler;
  readonly juncture: typeof juncture;
  readonly payload: typeof payload;
  readonly createForger: typeof createForger;
  readonly createSetup: typeof createSetup;
  readonly createRealm: typeof createRealm;
  readonly createCursor: typeof createCursor;
  readonly createXpCursor: typeof createXpCursor;
  readonly realm: typeof realm;
  readonly driver: typeof driver;
  readonly persistent: typeof persistent;
  readonly bitDefault: typeof bitDefault;
}

export const junctureSymbols: JunctureSymbols = {
  init,
  createPropertyAssembler,
  juncture,
  payload,
  createForger,
  createSetup,
  createRealm,
  createCursor,
  createXpCursor,
  realm,
  driver,
  persistent,
  bitDefault
};
