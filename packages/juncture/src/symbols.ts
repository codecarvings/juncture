/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const definitionKind = Symbol('definitionKind');
const definitionFn = Symbol('definitionFn');

export interface JSymbols {
  readonly definitionKind: typeof definitionKind;
  readonly definitionFn: typeof definitionFn;
}

export const jSymbols: JSymbols = {
  definitionKind,
  definitionFn
};
