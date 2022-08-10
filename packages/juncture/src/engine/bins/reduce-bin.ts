/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../design/access-modifier';
import {
  Descriptor, getFilteredDescriptorKeys, NotSuitableDescriptor
} from '../../design/descriptor';
import { DescriptorType } from '../../design/descriptor-type';
import { GenericReducer } from '../../design/descriptors/reducer';
import { GenericTrigger } from '../../design/descriptors/trigger';
import { Juncture, ValueOf } from '../../juncture';
import { jSymbols } from '../../symbols';
import { defineLazyProperty } from '../../tool/object';
import { OverloadParameters } from '../../tool/overload-types';
import { ReducerFrameHost } from '../frames/reducer-frame';
import { TriggerFrameHost } from '../frames/trigger-frame';
import { Gear } from '../gear';

// #region Common
type ReduceBinItem<D, V> =
  D extends GenericReducer<infer B, any> ? (...args : OverloadParameters<B>) => V
    :D extends GenericTrigger<infer B, any> ? (...args : OverloadParameters<B>) => V
      : NotSuitableDescriptor;

const binTypes = [DescriptorType.reducer, DescriptorType.trigger];
function createReduceBinBase<J extends Juncture>(
  gear: Gear,
  reducerFrameHost: ReducerFrameHost<J> & TriggerFrameHost<J>,
  internalUse: boolean
) {
  const { juncture } = gear;
  const keys = getFilteredDescriptorKeys(juncture, binTypes, internalUse);
  const bin: any = {};
  keys.forEach(key => {
    const desc: Descriptor<any, any, any> = (juncture as any)[key];
    if (desc.type === DescriptorType.reducer) {
      defineLazyProperty(
        bin,
        key,
        () => (...args: any) => gear.getHarmonizedValue(desc[jSymbols.payload](reducerFrameHost.reducer)(...args))
      );
    } else {
      defineLazyProperty(
        bin,
        key,
        () => (...args: any) => {
          // TODO
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const actions = desc[jSymbols.payload](reducerFrameHost.trigger)(...args);
          return gear.value;
        }
      );
    }
  });
  return bin;
}
// #endregion

// #region ReduceBin
type GenericReduceBin<J, V> = {
  readonly [K in keyof J as
  J[K] extends GenericReducer<any, AccessModifier.public> ? K
    : J[K] extends GenericTrigger<any, AccessModifier.public> ? K
      : never
  ]: ReduceBinItem<J[K], V>;
};
export type ReduceBin<J extends Juncture> = GenericReduceBin<J, ValueOf<J>>;

export function createReduceBin<J extends Juncture>(
  gear: Gear,
  reducerFrameHost: ReducerFrameHost<J> & TriggerFrameHost<J>
): ReduceBin<J> {
  return createReduceBinBase(gear, reducerFrameHost, false);
}
// #endregion

// #region InternalReduceBin
// Conditional type required as a workoaround for problems with key remapping
type GenericInternalReduceBin<J, V> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: ReduceBinItem<J[K], V>;
} : never;

export type InternalReduceBin<J extends Juncture> = GenericInternalReduceBin<J, ValueOf<J>>;

export interface InternalReduceBinHost<J extends Juncture> {
  readonly reduce: InternalReduceBin<J>;
}

export function createInternalReduceBin<J extends Juncture>(
  gear: Gear,
  reducerFrameHost: ReducerFrameHost<J> & TriggerFrameHost<J>
): InternalReduceBin<J> {
  return createReduceBinBase(gear, reducerFrameHost, true);
}
// #endregion
