/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access';
import { getFilteredDescriptorKeys } from '../../design/descriptor';
import { NotSuitableType, triggerableDescriptorTypes } from '../../design/descriptor-type';
import { GenericReducer } from '../../design/descriptors/reducer';
import { GenericTrigger } from '../../design/descriptors/trigger';
import { Driver } from '../../driver';
import { defineLazyProperty } from '../../tool/object';
import { OverloadParameters } from '../../tool/overload-types';
import { createAction } from '../action';
import { Gear } from '../gear';
import { Instruction } from '../instruction';

// #region Common
type ApplyBinItem<L> =
  L extends GenericTrigger<infer B, any> ? (...args : OverloadParameters<B>) => Instruction
    : L extends GenericReducer<infer B, any> ? (...args : OverloadParameters<B>) => Instruction
      : NotSuitableType;

function createApplyBinBase(gear: Gear, outerFilter: boolean) {
  const { driver } = gear;
  const keys = getFilteredDescriptorKeys(driver, triggerableDescriptorTypes, outerFilter);
  const bin: any = {};
  keys.forEach(key => {
    defineLazyProperty(
      bin,
      key,
      () => (...args: any) => createAction(gear.ref, key, args)
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

export function createApplyBin<D extends Driver>(
  gear: Gear
): ApplyBin<D> {
  return createApplyBinBase(gear, false);
}
// #endregion

// #region OuterApplyBin
export type OuterApplyBin<D> = {
  readonly [K in keyof D as
  D[K] extends GenericTrigger<any, AccessModifier.public> ? K
    : D[K] extends GenericReducer<any, AccessModifier.public> ? K
      : never
  ]: ApplyBinItem<D[K]>;
};

export function createOuterApplyBin<D extends Driver>(
  gear: Gear
): OuterApplyBin<D> {
  return createApplyBinBase(gear, true);
}
// #endregion
