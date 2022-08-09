/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../construction/access-modifier';
import {
  DescriptorType, getFilteredDescriptorKeys, NotSuitableDescriptor
} from '../../construction/descriptor';
import { GenericReducer } from '../../construction/descriptors/reducer';
import { GenericTrigger } from '../../construction/descriptors/trigger';
import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../misc/object-helpers';
import { OverloadParameters } from '../../misc/overloaed-function-types';
import { createAction, Dispatcher } from '../action';
import { Gear } from '../gear';

// #region Common
type DispatchBinItem<D> =
  D extends GenericReducer<infer B, any> ? (...args : OverloadParameters<B>) => void
    : D extends GenericTrigger<infer B, any> ? (...args : OverloadParameters<B>) => void
      : NotSuitableDescriptor;

const binTypes = [DescriptorType.reducer, DescriptorType.trigger];
function createDispatchBinBase(
  gear: Gear,
  dispatcher: Dispatcher,
  internalUse: boolean
) {
  const { juncture } = gear;
  const keys = getFilteredDescriptorKeys(juncture, binTypes, internalUse);
  const bin: any = {};
  keys.forEach(key => {
    defineLazyProperty(
      bin,
      key,
      () => (...args: any) => {
        dispatcher.dispatch(createAction(gear.ref, key, args));
      }
    );
  });
  return bin;
}
// #endregion

// #region DispatchBin
export type DispatchBin<J> = {
  readonly [K in keyof J as
  J[K] extends GenericReducer<any, AccessModifier.public> ? K
    : J[K] extends GenericTrigger<any, AccessModifier.public> ? K
      : never
  ]: DispatchBinItem<J[K]>;
};

export function createDispatchBin<J extends Juncture>(
  gear: Gear,
  dispatcher: Dispatcher
): DispatchBin<J> {
  return createDispatchBinBase(gear, dispatcher, false);
}
// #endregion

// #region InternalDispatchBin
// Conditional type required as a workoaround for problems with key remapping
export type InternalDispatchBin<J> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: DispatchBinItem<J[K]>;
} : never;

export interface InternalDispatchBinHost<J> {
  readonly dispatch: InternalDispatchBin<J>;
}

export function createInternalDispatchBin<J extends Juncture>(
  gear: Gear,
  dispatcher: Dispatcher
): InternalDispatchBin<J> {
  return createDispatchBinBase(gear, dispatcher, true);
}
// #endregion
