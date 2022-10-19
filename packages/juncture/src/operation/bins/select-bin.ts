/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access-modifier';
import { DescriptorKeyPrefix, DescriptorType } from '../../design/descriptor-type';
import { GenericParamSelector } from '../../design/descriptors/param-selector';
import { GenericSelector } from '../../design/descriptors/selector';
import { Driver } from '../../driver';
import { junctureSymbols } from '../../juncture-symbols';
import { ActiveQuerySelectionInspector } from '../frames/active-query-frame';
import { DefaultFrameHost } from '../frames/frame';
import { Realm } from '../realm';

// #region Common
type SelectBinItem<L> =
  L extends GenericSelector<infer B, any> ? B
    : L extends GenericParamSelector<infer B, any> ? B
      : never;

function createSelectBinBase<D extends Driver>(realm: Realm, frameHost: DefaultFrameHost<D>, isXp: boolean) {
  const { map } = realm.setup.selectors;
  const keys = isXp ? realm.setup.selectors.xpKeys : realm.setup.selectors.keys;
  const bin: any = {};
  keys.forEach(key => {
    const desc = map[key];
    if (desc.type === DescriptorType.selector) {
      Object.defineProperty(bin, key, {
        get: () => desc[junctureSymbols.payload](frameHost.default)
      });
    } else {
      // ParamSelector
      bin[key] = (...args: any) => desc[junctureSymbols.payload](frameHost.default)(...args);
    }
  });
  return bin;
}
// #endregion

// #region SelectBin
export type SelectBin<D> = D extends any ? {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.selector}.${infer W}` ? W : never] : SelectBinItem<D[K]>;
} : never;

export interface SelectBinHost<D> {
  readonly select: SelectBin<D>;
}

export function createSelectBin<D extends Driver>(realm: Realm, frameHost: DefaultFrameHost<D>): SelectBin<D> {
  return createSelectBinBase(realm, frameHost, false);
}
// #endregion

// #region XpSelectBin
type XpSelectBinKey<L, K> =
  L extends GenericSelector<any, AccessModifier.public> ? K
    : L extends GenericParamSelector<any, AccessModifier.public> ? K
      : never;

export type XpSelectBin<D> = {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.selector}.${infer W}` ?
    XpSelectBinKey<D[K], W> : never]: SelectBinItem<D[K]>;
};

export function createXpSelectBin<D extends Driver>(
  realm: Realm,
  frameHost: DefaultFrameHost<D>
): XpSelectBin<D> {
  return createSelectBinBase(realm, frameHost, true);
}
// #endregion

export function createActiveQuerySelectBin<D extends Driver>(
  realm: Realm,
  frameHost: DefaultFrameHost<D>,
  inspector: ActiveQuerySelectionInspector
): XpSelectBin<D> {
  const { map, xpKeys } = realm.setup.selectors;
  const bin: any = {};
  xpKeys.forEach(key => {
    const desc = map[key];
    if (desc.type === DescriptorType.selector) {
      Object.defineProperty(bin, key, {
        get: () => {
          inspector(true);
          const result = desc[junctureSymbols.payload](frameHost.default);
          inspector(false);
          return result;
        }
      });
    } else {
      // ParamSelector
      bin[key] = (...args: any) => {
        inspector(true);
        const result = desc[junctureSymbols.payload](frameHost.default)(...args);
        inspector(false);
        return result;
      };
    }
  });
  return bin;
}
