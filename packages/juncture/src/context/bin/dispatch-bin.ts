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

type DispatchBinItem<S> =
  S extends ReducerDefinition<any, infer B> ? (...args : OverloadParameters<B>) => void : typeof notAReducerDefinition;

export type DispatchBin<J> = {
  readonly [K in keyof J as J[K] extends ReducerDefinition<any, any> ? K : never]: DispatchBinItem<J[K]>;
};

// Conditional type required as a workoaround for problems with key remapping
export type PrivateDispatchBin<J> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: DispatchBinItem<J[K]>;
} : never;
