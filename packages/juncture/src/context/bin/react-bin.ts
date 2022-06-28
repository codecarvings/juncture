/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  notAReactorDefinition, ReactorDefinition
} from '../../kernel/reactor';
import { OverloadParameters } from '../../util/overloaed-function-types';

type ReactBinItem<R, V> =
  R extends ReactorDefinition<infer B> ? (...args : OverloadParameters<B>) => V : typeof notAReactorDefinition;

export type ReactBin<J, V> = {
  readonly [K in keyof J as J[K] extends ReactorDefinition<any> ? K : never]: ReactBinItem<J[K], V>;
};

// Conditional type required as a workoaround for problems with key remapping
export type PrivateReactBin<J, V> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: ReactBinItem<J[K], V>;
} : never;
