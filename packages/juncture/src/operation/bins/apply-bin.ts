/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access-modifier';
import { DescriptorKeyPrefix } from '../../design/descriptor-type';
import { GenericReactor } from '../../design/descriptors/reactor';
import { GenericSynthReactor } from '../../design/descriptors/synth-reactor';
import { Driver } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import { OverloadParameters } from '../../utilities/overload-types';
import { Instruction } from '../instruction';
import { Realm } from '../realm';

// #region Common
type ApplyBinItem<L> =
  L extends GenericReactor<infer B, any> ? (...args : OverloadParameters<B>) => Instruction
    : L extends GenericSynthReactor<infer B, any> ? (...args : OverloadParameters<B>) => Instruction
      : never;

function createApplyBinBase(realm: Realm, isXp: boolean) {
  const keys = isXp ? realm.setup.reactors.xpKeys : realm.setup.reactors.keys;
  const bin: any = {};
  keys.forEach(key => {
    defineLazyProperty(
      bin,
      key,
      () => (...args: any) => ({
        target: realm,
        key,
        payload: args
      })
    );
  });
  return bin;
}
// #endregion

// #region ApplyBin
export type ApplyBin<D> = D extends any ? {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.reactor}.${infer W}` ? W : never] : ApplyBinItem<D[K]>;
} : never;

export interface ApplyBinHost<D> {
  readonly apply: ApplyBin<D>;
}

export function createApplyBin<D extends Driver>(realm: Realm): ApplyBin<D> {
  return createApplyBinBase(realm, false);
}
// #endregion

// #region XpApplyBin
type XpApplyBinKey<L, K> =
  L extends GenericReactor<any, AccessModifier.public> ? K
    : L extends GenericSynthReactor<any, AccessModifier.public> ? K
      : never;

export type XpApplyBin<D> = {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.reactor}.${infer W}` ?
    XpApplyBinKey<D[K], W> : never]: ApplyBinItem<D[K]>;
};

export function createXpApplyBin<D extends Driver>(realm: Realm): XpApplyBin<D> {
  return createApplyBinBase(realm, true);
}
// #endregion
