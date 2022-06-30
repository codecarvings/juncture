/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Action,
  notAReducerDefinition, ReducerDefinition
} from '../../kernel/reducer';
import { OverloadParameters } from '../../util/overloaed-function-types';

type PrepareBinItem<S> =
  S extends ReducerDefinition<infer B>
    ? (...args : OverloadParameters<B>) => Action : typeof notAReducerDefinition;

export type PrepareBin<J> = {
  readonly [K in keyof J as J[K] extends ReducerDefinition<any> ? K : never]: PrepareBinItem<J[K]>;
};

// Conditional type required as a workoaround for problems with key remapping
export type PrivatePrepareBin<J> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: PrepareBinItem<J[K]>;
} : never;
