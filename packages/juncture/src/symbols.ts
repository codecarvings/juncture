/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const definitionKind = Symbol('definitionKind');
const definitionPayload = Symbol('definitionPayload');
const handledValue = Symbol('handledValue');
const paramSelectorTag = Symbol('paramSelectorTag');
const createDriver = Symbol('createDriver');
const createFrame = Symbol('createFrame');

export interface JSymbols {
  readonly definitionKind: typeof definitionKind;
  readonly definitionPayload: typeof definitionPayload;
  readonly handledValue: typeof handledValue;
  readonly paramSelectorTag: typeof paramSelectorTag;
  readonly createDriver: typeof createDriver;
  readonly createFrame: typeof createFrame;
}

export const jSymbols: JSymbols = {
  definitionKind,
  definitionPayload,
  handledValue,
  paramSelectorTag,
  createDriver,
  createFrame
};
