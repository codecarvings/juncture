/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefKind, getFilteredDefKeys } from '../../definition/def';
import { PrivateSuffix } from '../../definition/private';
import { notAUniReducerDef, UniReducerDef } from '../../definition/reducer';
import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { OverloadParameters } from '../../util/overloaed-function-types';
import { createAction, Dispatcher } from '../action';
import { Ctx } from '../ctx';

// #region Common
type DispatchBinItem<D> =
  D extends UniReducerDef<any, infer B> ? (...args : OverloadParameters<B>) => void : typeof notAUniReducerDef;

function createDispatchBinBase(
  ctx: Ctx,
  dispatch: Dispatcher,
  privateUse: boolean
) {
  const { juncture } = ctx;
  const keys = getFilteredDefKeys(juncture, privateUse, DefKind.reducer);
  const bin: any = {};
  keys.forEach(key => {
    defineLazyProperty(
      bin,
      key,
      () => (...args: any) => {
        dispatch(createAction(ctx.ref, key, args));
      }
    );
  });
  return bin;
}
// #endregion

// #region DispatchBin
export type DispatchBin<J> = {
  readonly [K in keyof J as
  J[K] extends PrivateSuffix ? never :
    J[K] extends UniReducerDef<any, any> ? K : never
  ]: DispatchBinItem<J[K]>;
};

export function createDispatchBin<J extends Juncture>(
  ctx: Ctx,
  dispatch: Dispatcher
): DispatchBin<J> {
  return createDispatchBinBase(ctx, dispatch, false);
}
// #endregion

// #region PrivateDispatchBin
// Conditional type required as a workoaround for problems with key remapping
export type PrivateDispatchBin<J> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: DispatchBinItem<J[K]>;
} : never;

export interface PrivateDispatchBinHost<J> {
  readonly dispatch: PrivateDispatchBin<J>;
}

export function createPrivateDispatchBin<J extends Juncture>(
  ctx: Ctx,
  dispatch: Dispatcher
): PrivateDispatchBin<J> {
  return createDispatchBinBase(ctx, dispatch, true);
}
// #endregion
