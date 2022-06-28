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

type DispatchBinItem<S> =
  S extends ReactorDefinition<infer B> ? (...args : OverloadParameters<B>) => void : typeof notAReactorDefinition;

export type DispatchBin<J> = {
  readonly [K in keyof J as J[K] extends ReactorDefinition<any> ? K : never]: DispatchBinItem<J[K]>;
};

// Conditional type required as a workoaround for problems with key remapping
export type PrivateDispatchBin<J> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: DispatchBinItem<J[K]>;
} : never;
