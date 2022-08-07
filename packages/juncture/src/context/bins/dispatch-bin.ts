/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ActivatorDef, notAnActivatorDef } from '../../definition/activator';
import {
  DefAccess, DefType, getFilteredDefKeys
} from '../../definition/def';
import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { OverloadParameters } from '../../util/overloaed-function-types';
import { createAction, Dispatcher } from '../action';
import { Ctx } from '../ctx';

// #region Common
type DispatchBinItem<D> =
  D extends ActivatorDef<any, any, infer B> ? (...args : OverloadParameters<B>) => void : typeof notAnActivatorDef;

function createDispatchBinBase(
  ctx: Ctx,
  dispatcher: Dispatcher,
  internalUse: boolean
) {
  const { juncture } = ctx;
  const keys = getFilteredDefKeys(juncture, DefType.reducer, internalUse);
  const bin: any = {};
  keys.forEach(key => {
    defineLazyProperty(
      bin,
      key,
      () => (...args: any) => {
        dispatcher.dispatch(createAction(ctx.ref, key, args));
      }
    );
  });
  return bin;
}
// #endregion

// #region DispatchBin
export type DispatchBin<J> = {
  readonly [K in keyof J as J[K] extends ActivatorDef<any, DefAccess.public, any> ? K : never]: DispatchBinItem<J[K]>;
};

export function createDispatchBin<J extends Juncture>(
  ctx: Ctx,
  dispatcher: Dispatcher
): DispatchBin<J> {
  return createDispatchBinBase(ctx, dispatcher, false);
}
// #endregion

// #region InternalDispatchBin
// Conditional type required as a workoaround for problems with key remapping
export type InternalDispatchBin<J> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: DispatchBinItem<J[K]>;
} : never;

export interface InternalDispatchBinHost<J> {
  readonly dispatch: InternalDispatchBin<J>;
}

export function createInternalDispatchBin<J extends Juncture>(
  ctx: Ctx,
  dispatcher: Dispatcher
): InternalDispatchBin<J> {
  return createDispatchBinBase(ctx, dispatcher, true);
}
// #endregion
