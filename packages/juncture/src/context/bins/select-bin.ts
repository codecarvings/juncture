/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Def, DefKind, getFilteredDefKeys } from '../../definition/def';
import { PrivateSuffix } from '../../definition/private';
import { isParamSelectorDef, isSelectorDef, notAUniSelectorDef, UniSelectorDef } from '../../definition/selector';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';
import { defineGetter, defineLazyProperty } from '../../util/object';
import { Ctx } from '../ctx';
import { SelectorFrameHost } from '../frames/selector-frame';

// #region Common
type SelectBinItem<D> = D extends UniSelectorDef<any, infer B> ? B : typeof notAUniSelectorDef;

function createSelectBinBase<J extends Juncture>(
  ctx: Ctx,
  selectorFrameHost: SelectorFrameHost<J>,
  privateUse: boolean
) {
  const { juncture } = ctx;
  const keys = getFilteredDefKeys(juncture, privateUse, DefKind.selector);
  const bin: any = {};
  keys.forEach(key => {
    const def = (juncture as any)[key];
    if (isSelectorDef(def)) {
      defineGetter(bin, key, () => def[jSymbols.defPayload](selectorFrameHost.selector));
    } else if (isParamSelectorDef(def)) {
      defineLazyProperty(
        bin,
        key,
        () => (...args: any) => def[jSymbols.defPayload](selectorFrameHost.selector)(...args)
      );
    } else {
      throw Error(`Unable to create SelectorBin: Unknwon subKind: "${(def as Def<any, any, any>).defSubKind}"`);
    }
  });
  return bin;
}
// #endregion

// #region SelectBin
export type SelectBin<J> = {
  readonly [K in keyof J as
  J[K] extends PrivateSuffix ? never :
    J[K] extends UniSelectorDef<any, any> ? K : never
  ]: SelectBinItem<J[K]>;
};

export function createSelectBin<J extends Juncture>(
  ctx: Ctx,
  selectorFrameHost: SelectorFrameHost<J>
): SelectBin<J> {
  return createSelectBinBase(ctx, selectorFrameHost, false);
}
// #endregion

// #region PrivateSelectBin
// Conditional type required as a workoaround for problems with key remapping
export type PrivateSelectBin<J> = J extends any ? {
  // readonly [K in keyof J as J[K] extends SelectorDef<any, any> ? K : never]: SelectBinItem<J[K]>;
  readonly [K in keyof J as K extends string ? K : never]: SelectBinItem<J[K]>;
} : never;

export interface PrivateSelectBinHost<J> {
  readonly select: PrivateSelectBin<J>;
}

export function createPrivateSelectBin<J extends Juncture>(
  ctx: Ctx,
  selectorFrameHost: SelectorFrameHost<J>
): PrivateSelectBin<J> {
  return createSelectBinBase(ctx, selectorFrameHost, true);
}
// #endregion
