/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../design/access-modifier';
import { getFilteredDescriptorKeys } from '../../design/descriptor';
import { applicableDescriptorTypes, NotSuitableType } from '../../design/descriptor-type';
import { GenericReducer } from '../../design/descriptors/reducer';
import { GenericTrigger } from '../../design/descriptors/trigger';
import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { OverloadParameters } from '../../tool/overload-types';
import { createAction } from '../action';
import { Gear } from '../gear';
import { Instruction } from '../instruction';

// #region Common
type ApplyBinItem<D> =
  D extends GenericReducer<infer B, any> ? (...args : OverloadParameters<B>) => Instruction
    : D extends GenericTrigger<infer B, any> ? (...args : OverloadParameters<B>) => Instruction
      : NotSuitableType;

function createApplyBinBase(
  gear: Gear,
  internalUse: boolean
) {
  const { juncture } = gear;
  const keys = getFilteredDescriptorKeys(juncture, applicableDescriptorTypes, internalUse);
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
export type ApplyBin<J> = {
  readonly [K in keyof J as
  J[K] extends GenericReducer<any, AccessModifier.public> ? K
    : J[K] extends GenericTrigger<any, AccessModifier.public> ? K
      : never
  ]: ApplyBinItem<J[K]>;
};

export function createApplyBin<J extends Juncture>(
  gear: Gear
): ApplyBin<J> {
  return createApplyBinBase(gear, false);
}
// #endregion

// #region InternalApplyBin
// Conditional type required as a workoaround for problems with key remapping
export type InternalApplyBin<J> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: ApplyBinItem<J[K]>;
} : never;

export interface InternalApplyBinHost<J> {
  readonly apply: InternalApplyBin<J>;
}

export function createInternalApplyBin<J extends Juncture>(
  gear: Gear
): InternalApplyBin<J> {
  return createApplyBinBase(gear, true);
}
// #endregion
