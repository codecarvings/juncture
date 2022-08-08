/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Def, DefAccess, DefType, getFilteredDefKeys, NotSuitableDefType
} from '../../definition/def';
import { ParamSelectorDef } from '../../definition/param-selector';
import { SelectorDef } from '../../definition/selector';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';
import { defineLazyProperty } from '../../util/object';
import { Ctx } from '../ctx';
import { SelectorFrameHost } from '../frames/selector-frame';

// #region Common
type SelectBinItem<D> =
  D extends SelectorDef<infer B, any> ? B
    : D extends ParamSelectorDef<infer B, any> ? B
      : NotSuitableDefType;

const binTypes = [DefType.selector, DefType.paramSelector];
function createSelectBinBase<J extends Juncture>(
  ctx: Ctx,
  selectorFrameHost: SelectorFrameHost<J>,
  internalUse: boolean
) {
  const { juncture } = ctx;
  const keys = getFilteredDefKeys(juncture, binTypes, internalUse);
  const bin: any = {};
  keys.forEach(key => {
    const def: Def<any, any, any> = (juncture as any)[key];
    if (def.type === DefType.selector) {
      Object.defineProperty(bin, key, {
        get: () => def[jSymbols.defPayload](selectorFrameHost.selector)
      });
    } else {
      defineLazyProperty(
        bin,
        key,
        () => (...args: any) => def[jSymbols.defPayload](selectorFrameHost.selector)(...args)
      );
    }
  });
  return bin;
}
// #endregion

// #region SelectBin
export type SelectBin<J> = {
  readonly [K in keyof J as
  J[K] extends SelectorDef<any, DefAccess.public> ? K
    : J[K] extends ParamSelectorDef<any, DefAccess.public> ? K
      : never
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
