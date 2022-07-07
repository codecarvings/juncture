/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  notAReducerDefinition, ReducerDefinition
} from '../../kernel/reducer';
import { OverloadParameters } from '../../util/overloaed-function-types';

type ReduceBinItem<R, V> =
  R extends ReducerDefinition<any, infer B> ? (...args : OverloadParameters<B>) => V : typeof notAReducerDefinition;

export type ReduceBin<J, V> = {
  readonly [K in keyof J as J[K] extends ReducerDefinition<any, any> ? K : never]: ReduceBinItem<J[K], V>;
};

// Conditional type required as a workoaround for problems with key remapping
export type PrivateReduceBin<J, V> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: ReduceBinItem<J[K], V>;
} : never;
