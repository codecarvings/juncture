/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Def, DefKind, getFilteredDefKeys } from '../../definition/def';
import { PrivateSuffix } from '../../definition/private';
import {
  isMixReducerDef, isReducerDef, notAUniReducerDef, UniReducerDef
} from '../../definition/reducer';
import { Juncture, ValueOf } from '../../juncture';
import { jSymbols } from '../../symbols';
import { defineLazyProperty } from '../../util/object';
import { OverloadParameters } from '../../util/overloaed-function-types';
import { Ctx } from '../ctx';
import { MixReducerFrameHost } from '../frames/mix-reducer-frame';
import { ReducerFrameHost } from '../frames/reducer-frame';

// #region Common
type ReduceBinItem<D, V> =
  D extends UniReducerDef<any, infer B> ? (...args : OverloadParameters<B>) => V : typeof notAUniReducerDef;

function createReduceBinBase<J extends Juncture>(
  ctx: Ctx,
  reducerFrameHost: ReducerFrameHost<J> & MixReducerFrameHost<J>,
  privateUse: boolean
) {
  const { juncture } = ctx;
  const keys = getFilteredDefKeys(juncture, privateUse, DefKind.reducer);
  const bin: any = {};
  keys.forEach(key => {
    const def = (juncture as any)[key];
    if (isReducerDef(def)) {
      defineLazyProperty(
        bin,
        key,
        () => (...args: any) => {
          // Execute the reducer
          const handledValue = def[jSymbols.defPayload](reducerFrameHost.reducer)(...args);
          // Transform the handled value into a value
          return juncture[jSymbols.adaptHandledValue](ctx.value, handledValue);
        }
      );
    } else if (isMixReducerDef(def)) {
      defineLazyProperty(
        bin,
        key,
        () => (...args: any) => {
          // TODO
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const actions = def[jSymbols.defPayload](reducerFrameHost.mixReducer)(...args);
          return ctx.value;
        }
      );
    } else {
      throw Error(`Unable to create ReducerBin: Unknwon Reducer subKind: "${(def as Def<any, any, any>).defSubKind}"`);
    }
  });
  return bin;
}
// #endregion

// #region ReduceBin
type GenericReduceBin<J, V> = {
  readonly [K in keyof J as
  J[K] extends PrivateSuffix ? never :
    J[K] extends UniReducerDef<any, any> ? K : never
  ]: ReduceBinItem<J[K], V>;
};
export type ReduceBin<J extends Juncture> = GenericReduceBin<J, ValueOf<J>>;

export function createReduceBin<J extends Juncture>(
  ctx: Ctx,
  reducerFrameHost: ReducerFrameHost<J> & MixReducerFrameHost<J>
): ReduceBin<J> {
  return createReduceBinBase(ctx, reducerFrameHost, false);
}
// #endregion

// #region PrivateReduceBin
// Conditional type required as a workoaround for problems with key remapping
type GenericPrivateReduceBin<J, V> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: ReduceBinItem<J[K], V>;
} : never;

export type PrivateReduceBin<J extends Juncture> = GenericPrivateReduceBin<J, ValueOf<J>>;

export interface PrivateReduceBinHost<J extends Juncture> {
  readonly reduce: PrivateReduceBin<J>;
}

export function createPrivateReduceBin<J extends Juncture>(
  ctx: Ctx,
  reducerFrameHost: ReducerFrameHost<J> & MixReducerFrameHost<J>
): PrivateReduceBin<J> {
  return createReduceBinBase(ctx, reducerFrameHost, true);
}
// #endregion
