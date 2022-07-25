/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefKind, getFilteredDefKeys } from '../../definition/def';
import { PrivateSuffix } from '../../definition/private';
import { isDirectSelectorDef, notASelectorDef, SelectorDef } from '../../definition/selector';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';
import { defineGetter, defineLazyProperty } from '../../util/object';
import { SelectorFrameProvider } from '../frames/selector-frame';

// #region Common
type SelectBinItem<D> = D extends SelectorDef<any, infer B> ? B : typeof notASelectorDef;

function createSelectBinBase<J extends Juncture>(
  juncture: J,
  selectorFrameProvider: SelectorFrameProvider<J>,
  privateUse: boolean
) {
  const keys = getFilteredDefKeys(juncture, privateUse, DefKind.selector);
  const bin: any = {};
  keys.forEach(key => {
    const def = (juncture as any)[key];
    if (isDirectSelectorDef(def)) {
      defineGetter(bin, key, () => def[jSymbols.defPayload](selectorFrameProvider.selector));
    } else {
      defineLazyProperty(
        bin,
        key,
        () => (...args: any) => def[jSymbols.defPayload](selectorFrameProvider.selector)(...args)
      );
    }
  });
  return bin;
}
// #endregion

// #region SelectBin
export type SelectBin<J> = {
  readonly [K in keyof J as
  J[K] extends PrivateSuffix ? never :
    J[K] extends SelectorDef<any, any> ? K : never
  ]: SelectBinItem<J[K]>;
};

export function createSelectBin<J extends Juncture>(
  juncture: J,
  selectorFrameProvider: SelectorFrameProvider<J>
): SelectBin<J> {
  return createSelectBinBase(juncture, selectorFrameProvider, false);
}
// #endregion

// #region PrivateSelectBin
// Conditional type required as a workoaround for problems with key remapping
export type PrivateSelectBin<J> = J extends any ? {
  // readonly [K in keyof J as J[K] extends SelectorDef<any, any> ? K : never]: SelectBinItem<J[K]>;
  readonly [K in keyof J as K extends string ? K : never]: SelectBinItem<J[K]>;
} : never;

export interface PrivateSelectBinProvider<J> {
  readonly select: PrivateSelectBin<J>;
}

export function createPrivateSelectBin<J extends Juncture>(
  juncture: J,
  selectorFrameProvider: SelectorFrameProvider<J>
): PrivateSelectBin<J> {
  return createSelectBinBase(juncture, selectorFrameProvider, true);
}
// #endregion
