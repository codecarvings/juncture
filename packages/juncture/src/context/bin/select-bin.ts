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

type SelectBinItem<S> = S extends SelectorDefinition<any, infer B> ? B : typeof notASelectorDefinition;

export type SelectBin<J> = {
  readonly [K in keyof J as J[K] extends SelectorDefinition<any, any> ? K : never]: SelectBinItem<J[K]>;
};

// Conditional type required as a workoaround for problems with key remapping
export type PrivateSelectBin<J> = J extends any ? {
  // readonly [K in keyof J as J[K] extends SelectorDefinition<any> ? K : never]: SelectBinItem<J[K]>;
  readonly [K in keyof J as K extends string ? K : never]: SelectBinItem<J[K]>;
} : never;
