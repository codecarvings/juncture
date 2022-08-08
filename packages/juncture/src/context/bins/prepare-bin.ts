/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DefAccess, DefType, getFilteredDefKeys, NotSuitableDefType
} from '../../definition/def';
import { ReducerDef } from '../../definition/reducer';
import { TriggerDef } from '../../definition/trigger';
import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { OverloadParameters } from '../../util/overloaed-function-types';
import { Action, createAction } from '../action';
import { Ctx } from '../ctx';

// #region Common
type PrepareBinItem<D> =
  D extends ReducerDef<infer B, any> ? (...args : OverloadParameters<B>) => Action
    : D extends TriggerDef<infer B, any> ? (...args : OverloadParameters<B>) => Action
      : NotSuitableDefType;

const binTypes = [DefType.reducer, DefType.trigger];
function createPrepareBinBase(
  ctx: Ctx,
  internalUse: boolean
) {
  const { juncture } = ctx;
  const keys = getFilteredDefKeys(juncture, binTypes, internalUse);
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
  J[K] extends ReducerDef<any, DefAccess.public> ? K
    : J[K] extends TriggerDef<any, DefAccess.public> ? K
      : never
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
export type InternalPrepareBin<J> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: PrepareBinItem<J[K]>;
} : never;

export interface InternalPrepareBinHost<J> {
  readonly prepare: InternalPrepareBin<J>;
}

export function createInternalPrepareBin<J extends Juncture>(
  ctx: Ctx
): InternalPrepareBin<J> {
  return createPrepareBinBase(ctx, true);
}
// #endregion
