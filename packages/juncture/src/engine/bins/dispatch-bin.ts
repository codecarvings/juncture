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
import { createAction, Dispatcher } from '../action';
import { Gear } from '../gear';

// #region Common
type DispatchBinItem<L> =
  L extends GenericTrigger<infer B, any> ? (...args : OverloadParameters<B>) => void
    : L extends GenericReducer<infer B, any> ? (...args : OverloadParameters<B>) => void
      : NotSuitableType;

function createDispatchBinBase(gear: Gear, dispatcher: Dispatcher, outerFilter: boolean) {
  const { driver } = gear;
  const keys = getFilteredDescriptorKeys(driver, triggerableDescriptorTypes, outerFilter);
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
// Conditional type required as a workoaround for problems with key remapping
export type DispatchBin<D> = D extends any ? {
  readonly [K in keyof D as K extends string ? K : never]: DispatchBinItem<D[K]>;
} : never;

export interface DispatchBinHost<D> {
  readonly dispatch: DispatchBin<D>;
}

export function createDispatchBin<D extends Driver>(
  gear: Gear,
  dispatcher: Dispatcher
): DispatchBin<D> {
  return createDispatchBinBase(gear, dispatcher, false);
}
// #endregion

// #region OuterDispatchBin
export type OuterDispatchBin<D> = {
  readonly [K in keyof D as
  D[K] extends GenericTrigger<any, AccessModifier.public> ? K
    : D[K] extends GenericReducer<any, AccessModifier.public> ? K
      : never
  ]: DispatchBinItem<D[K]>;
};

export function createOuterDispatchBin<D extends Driver>(
  gear: Gear,
  dispatcher: Dispatcher
): OuterDispatchBin<D> {
  return createDispatchBinBase(gear, dispatcher, true);
}
// #endregion
