/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  ActivatorDef, isReducerDef, isTriggerDef, notAnActivatorDef
} from '../../definition/activator';
import { DefAccess, DefType, getFilteredDefKeys } from '../../definition/def';
import { MixedDef } from '../../definition/mixed-def';
import { Juncture, ValueOf } from '../../juncture';
import { jSymbols } from '../../symbols';
import { defineLazyProperty } from '../../util/object';
import { OverloadParameters } from '../../util/overloaed-function-types';
import { Ctx } from '../ctx';
import { ReducerFrameHost } from '../frames/reducer-frame';
import { TriggerFrameHost } from '../frames/trigger-frame';

// #region Common
type ReduceBinItem<D, V> =
  D extends ActivatorDef<any, any, infer B> ? (...args : OverloadParameters<B>) => V : typeof notAnActivatorDef;

function createReduceBinBase<J extends Juncture>(
  ctx: Ctx,
  reducerFrameHost: ReducerFrameHost<J> & TriggerFrameHost<J>,
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
    } else if (isTriggerDef(def)) {
      defineLazyProperty(
        bin,
        key,
        () => (...args: any) => {
          // TODO
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const actions = def[jSymbols.defPayload](reducerFrameHost.trigger)(...args);
          return ctx.value;
        }
      );
    } else {
      // eslint-disable-next-line max-len
      throw Error(`Unable to create ReducerBin: Unknwon variety: "${(def as MixedDef<any, any, any, any>).variety}"`);
    }
  });
  return bin;
}
// #endregion

// #region ReduceBin
type GenericReduceBin<J, V> = {
  readonly [K in keyof J as
  J[K] extends ActivatorDef<any, DefAccess.public, any> ? K : never
  ]: ReduceBinItem<J[K], V>;
};
export type ReduceBin<J extends Juncture> = GenericReduceBin<J, ValueOf<J>>;

export function createReduceBin<J extends Juncture>(
  ctx: Ctx,
  reducerFrameHost: ReducerFrameHost<J> & TriggerFrameHost<J>
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
  reducerFrameHost: ReducerFrameHost<J> & TriggerFrameHost<J>
): InternalReduceBin<J> {
  return createReduceBinBase(ctx, reducerFrameHost, true);
}
// #endregion
