/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const defPayload = Symbol('defPayload');
const handledValue = Symbol('handledValue');
const createDriver = Symbol('createDriver');
const createFrame = Symbol('createFrame');

export interface JSymbols {
  readonly defPayload: typeof defPayload;
  readonly handledValue: typeof handledValue;
  readonly createDriver: typeof createDriver;
  readonly createFrame: typeof createFrame;
}

export const jSymbols: JSymbols = {
  defPayload,
  handledValue,
  createDriver,
  createFrame
};
