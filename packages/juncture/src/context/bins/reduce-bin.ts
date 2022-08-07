/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefAccess, DefType, getFilteredDefKeys } from '../../definition/def';
import {
  isMixReducerDef, isReducerDef, notAUniReducerDef, UniReducerDef
} from '../../definition/reducer';
import { UniDef } from '../../definition/uni-def';
import { Juncture, ValueOf } from '../../juncture';
import { jSymbols } from '../../symbols';
import { defineLazyProperty } from '../../util/object';
import { OverloadParameters } from '../../util/overloaed-function-types';
import { Ctx } from '../ctx';
import { MixReducerFrameHost } from '../frames/mix-reducer-frame';
import { ReducerFrameHost } from '../frames/reducer-frame';

// #region Common
type ReduceBinItem<D, V> =
  D extends UniReducerDef<any, any, infer B> ? (...args : OverloadParameters<B>) => V : typeof notAUniReducerDef;

function createReduceBinBase<J extends Juncture>(
  ctx: Ctx,
  reducerFrameHost: ReducerFrameHost<J> & MixReducerFrameHost<J>,
  internalUse: boolean
) {
  const { juncture } = ctx;
  const keys = getFilteredDefKeys(juncture, DefType.reducer, internalUse);
  const bin: any = {};
  keys.forEach(key => {
    const def = (juncture as any)[key];
    if (isReducerDef(def)) {
      defineLazyProperty(
        bin,
        key,
        () => (...args: any) => ctx.getHarmonizedValue(def[jSymbols.defPayload](reducerFrameHost.reducer)(...args))
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
      // eslint-disable-next-line max-len
      throw Error(`Unable to create ReducerBin: Unknwon Reducer variety: "${(def as UniDef<any, any, any, any>).variety}"`);
    }
  });
  return bin;
}
// #endregion

// #region ReduceBin
type GenericReduceBin<J, V> = {
  readonly [K in keyof J as
  J[K] extends UniReducerDef<any, DefAccess.public, any> ? K : never
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

// #region InternalReduceBin
// Conditional type required as a workoaround for problems with key remapping
type GenericInternalReduceBin<J, V> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: ReduceBinItem<J[K], V>;
} : never;

export type InternalReduceBin<J extends Juncture> = GenericInternalReduceBin<J, ValueOf<J>>;

export interface InternalReduceBinHost<J extends Juncture> {
  readonly reduce: InternalReduceBin<J>;
}

export function createInternalReduceBin<J extends Juncture>(
  ctx: Ctx,
  reducerFrameHost: ReducerFrameHost<J> & MixReducerFrameHost<J>
): InternalReduceBin<J> {
  return createReduceBinBase(ctx, reducerFrameHost, true);
}
// #endregion
