/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../design/access-modifier';
import {
  getFilteredDescriptorKeys, NotSuitableDescriptor
} from '../../design/descriptor';
import { DescriptorType } from '../../design/descriptor-type';
import { GenericReducer } from '../../design/descriptors/reducer';
import { GenericTrigger } from '../../design/descriptors/trigger';
import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { OverloadParameters } from '../../tool/overload-types';
import { Action, createAction } from '../action';
import { Gear } from '../gear';

// #region Common
type PrepareBinItem<D> =
  D extends GenericReducer<infer B, any> ? (...args : OverloadParameters<B>) => Action
    : D extends GenericTrigger<infer B, any> ? (...args : OverloadParameters<B>) => Action
      : NotSuitableDescriptor;

const binTypes = [DescriptorType.reducer, DescriptorType.trigger];
function createPrepareBinBase(
  gear: Gear,
  internalUse: boolean
) {
  const { juncture } = gear;
  const keys = getFilteredDescriptorKeys(juncture, binTypes, internalUse);
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

// #region PrepareBin
export type PrepareBin<J> = {
  readonly [K in keyof J as
  J[K] extends GenericReducer<any, AccessModifier.public> ? K
    : J[K] extends GenericTrigger<any, AccessModifier.public> ? K
      : never
  ]: PrepareBinItem<J[K]>;
};

export function createPrepareBin<J extends Juncture>(
  gear: Gear
): PrepareBin<J> {
  return createPrepareBinBase(gear, false);
}
// #endregion

// #region PrivatePrepareBin
// Conditional type required as a workoaround for problems with key remapping
export type InternalPrepareBin<J> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: PrepareBinItem<J[K]>;
} : never;

export interface InternalPrepareBinHost<J> {
  readonly prepare: InternalPrepareBin<J>;
}

export function createInternalPrepareBin<J extends Juncture>(
  gear: Gear
): InternalPrepareBin<J> {
  return createPrepareBinBase(gear, true);
}
// #endregion
