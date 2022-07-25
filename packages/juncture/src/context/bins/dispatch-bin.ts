/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PrivateSuffix } from '../../definition/private';
import { notAReducerDef, ReducerDef } from '../../definition/reducer';
import { OverloadParameters } from '../../util/overloaed-function-types';

// #region Common
type DispatchBinItem<D> =
  D extends ReducerDef<any, infer B> ? (...args : OverloadParameters<B>) => void : typeof notAReducerDef;
// #endregion

// #region DispatchBin
export type DispatchBin<J> = {
  readonly [K in keyof J as
  J[K] extends PrivateSuffix ? never :
    J[K] extends ReducerDef<any, any> ? K : never
  ]: DispatchBinItem<J[K]>;
};
// #endregion

// #region PrivateDispatchBin
// Conditional type required as a workoaround for problems with key remapping
export type PrivateDispatchBin<J> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: DispatchBinItem<J[K]>;
} : never;
// #endregion
