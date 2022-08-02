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
import { Action, createAction } from '../action';
import { Ctx } from '../ctx';

// #region Common
type PrepareBinItem<D> =
D extends UniReducerDef<any, infer B>
  ? (...args : OverloadParameters<B>) => Action : typeof notAUniReducerDef;

function createPrepareBinBase(
  ctx: Ctx,
  privateUse: boolean
) {
  const { juncture } = ctx;
  const keys = getFilteredDefKeys(juncture, privateUse, DefKind.reducer);
  const bin: any = {};
  keys.forEach(key => {
    defineLazyProperty(
      bin,
      key,
      () => (...args: any) => createAction(ctx.ref, key, args)
    );
  });
  return bin;
}
// #endregion

// #region PrepareBin
export type PrepareBin<J> = {
  readonly [K in keyof J as
  J[K] extends PrivateSuffix ? never :
    J[K] extends UniReducerDef<any, any> ? K : never
  ]: PrepareBinItem<J[K]>;
};

export function createPrepareBin<J extends Juncture>(
  ctx: Ctx
): PrepareBin<J> {
  return createPrepareBinBase(ctx, false);
}
// #endregion

// #region PrivatePrepareBin
// Conditional type required as a workoaround for problems with key remapping
export type PrivatePrepareBin<J> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: PrepareBinItem<J[K]>;
} : never;

export interface PrivatePrepareBinHost<J> {
  readonly prepare: PrivatePrepareBin<J>;
}

export function createPrivatePrepareBin<J extends Juncture>(
  ctx: Ctx
): PrivatePrepareBin<J> {
  return createPrepareBinBase(ctx, true);
}
// #endregion
