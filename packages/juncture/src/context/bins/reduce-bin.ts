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
type ReduceBinItem<D, V> =
D extends ReducerDef<any, infer B> ? (...args : OverloadParameters<B>) => V : typeof notAReducerDef;
// #endregion

// #region ReduceBin
export type ReduceBin<J, V> = {
  readonly [K in keyof J as
  J[K] extends PrivateSuffix ? never :
    J[K] extends ReducerDef<any, any> ? K : never
  ]: ReduceBinItem<J[K], V>;
};
// #endregion

// #region PrivateReduceBin
// Conditional type required as a workoaround for problems with key remapping
export type PrivateReduceBin<J, V> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: ReduceBinItem<J[K], V>;
} : never;
// #endregion
