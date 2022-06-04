/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  notASelectorDefinition, SelectorDefinition
} from '../../kernel/selector';

type SelectBinItem<S> =
    S extends SelectorDefinition<infer Y> ? Y : typeof notASelectorDefinition;

export type SelectBin<J> = {
  readonly [K in keyof J as J[K] extends SelectorDefinition<any> ? K : never]: SelectBinItem<J[K]>;
};

export type PrivateSelectBin<J> = {
  // readonly [K in keyof J as J[K] extends SelectorDefinition<any> ? K : never]: SelectBinItem<J[K]>;
  readonly [K in keyof J as K extends string ? K : never]: SelectBinItem<J[K]>;
};
