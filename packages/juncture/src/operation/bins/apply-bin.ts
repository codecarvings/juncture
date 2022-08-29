/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access';
import { getFilteredDescriptorKeys } from '../../design/descriptor';
import { descriptorTypeFamilies, NotSuitableType } from '../../design/descriptor-type';
import { GenericReactor } from '../../design/descriptors/reactor';
import { GenericSynthReactor } from '../../design/descriptors/synth-reactor';
import { Driver } from '../../driver';
import { defineLazyProperty } from '../../tool/object';
import { OverloadParameters } from '../../tool/overload-types';
import { Instruction } from '../instruction';
import { Realm } from '../realm';

// #region Common
type ApplyBinItem<L> =
  L extends GenericReactor<infer B, any> ? (...args : OverloadParameters<B>) => Instruction
    : L extends GenericSynthReactor<infer B, any> ? (...args : OverloadParameters<B>) => Instruction
      : NotSuitableType;

function createApplyBinBase(realm: Realm, outerFilter: boolean) {
  const { driver } = realm;
  const keys = getFilteredDescriptorKeys(driver, descriptorTypeFamilies.reactable, outerFilter);
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
// Conditional type required as a workoaround for problems with key remapping
export type ApplyBin<D> = D extends any ? {
  readonly [K in keyof D as K extends string ? K : never]: ApplyBinItem<D[K]>;
} : never;

export interface ApplyBinHost<D> {
  readonly apply: ApplyBin<D>;
}

export function createApplyBin<D extends Driver>(realm: Realm): ApplyBin<D> {
  return createApplyBinBase(realm, false);
}
// #endregion

// #region OuterApplyBin
export type OuterApplyBin<D> = {
  readonly [K in keyof D as
  D[K] extends GenericReactor<any, AccessModifier.public> ? K
    : D[K] extends GenericSynthReactor<any, AccessModifier.public> ? K
      : never
  ]: ApplyBinItem<D[K]>;
};

export function createOuterApplyBin<D extends Driver>(realm: Realm): OuterApplyBin<D> {
  return createApplyBinBase(realm, true);
}
// #endregion
