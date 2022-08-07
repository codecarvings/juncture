/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefAccess, DefType, getFilteredDefKeys } from '../../definition/def';
import {
  isParamSelectorDef, isSelectorDef, notAUniSelectorDef, UniSelectorDef
} from '../../definition/selector';
import { UniDef } from '../../definition/uni-def';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';
import { defineLazyProperty } from '../../util/object';
import { Ctx } from '../ctx';
import { SelectorFrameHost } from '../frames/selector-frame';

// #region Common
type SelectBinItem<D> = D extends UniSelectorDef<any, any, infer B> ? B : typeof notAUniSelectorDef;

function createSelectBinBase<J extends Juncture>(
  ctx: Ctx,
  selectorFrameHost: SelectorFrameHost<J>,
  internalUse: boolean
) {
  const { juncture } = ctx;
  const keys = getFilteredDefKeys(juncture, DefType.selector, internalUse);
  const bin: any = {};
  keys.forEach(key => {
    const def = (juncture as any)[key];
    if (isSelectorDef(def)) {
      Object.defineProperty(bin, key, {
        get: () => def[jSymbols.defPayload](selectorFrameHost.selector)
      });
    } else if (isParamSelectorDef(def)) {
      defineLazyProperty(
        bin,
        key,
        () => (...args: any) => def[jSymbols.defPayload](selectorFrameHost.selector)(...args)
      );
    } else {
      // eslint-disable-next-line max-len
      throw Error(`Unable to create SelectorBin: Unknwon variety: "${(def as UniDef<any, any, any, any>).variety}"`);
    }
  });
  return bin;
}
// #endregion

// #region SelectBin
export type SelectBin<J> = {
  readonly [K in keyof J as
  J[K] extends UniSelectorDef<any, DefAccess.public, any> ? K : never
  ]: SelectBinItem<J[K]>;
};

export function createSelectBin<J extends Juncture>(
  ctx: Ctx,
  selectorFrameHost: SelectorFrameHost<J>
): SelectBin<J> {
  return createSelectBinBase(ctx, selectorFrameHost, false);
}
// #endregion

// #region InternalSelectBin
// Conditional type required as a workoaround for problems with key remapping
export type InternalSelectBin<J> = J extends any ? {
  // readonly [K in keyof J as J[K] extends SelectorDef<any, any> ? K : never]: SelectBinItem<J[K]>;
  readonly [K in keyof J as K extends string ? K : never]: SelectBinItem<J[K]>;
} : never;

export interface InternalSelectBinHost<J> {
  readonly select: InternalSelectBin<J>;
}

export function createInternalSelectBin<J extends Juncture>(
  ctx: Ctx,
  selectorFrameHost: SelectorFrameHost<J>
): InternalSelectBin<J> {
  return createSelectBinBase(ctx, selectorFrameHost, true);
}
// #endregion
