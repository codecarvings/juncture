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
import { Dispatcher } from '../action';
import { Realm } from '../realm';

// #region Common
type DispatchBinItem<L> =
  L extends GenericReactor<infer B, any> ? (...args : OverloadParameters<B>) => void
    : L extends GenericSynthReactor<infer B, any> ? (...args : OverloadParameters<B>) => void
      : NotSuitableType;

function createDispatchBinBase(realm: Realm, dispatcher: Dispatcher, outerFilter: boolean) {
  const { driver } = realm;
  const keys = getFilteredDescriptorKeys(driver, descriptorTypeFamilies.reactable, outerFilter);
  const bin: any = {};
  keys.forEach(key => {
    defineLazyProperty(
      bin,
      key,
      () => (...args: any) => {
        dispatcher.dispatch({
          target: realm.ref, key, payload: args
        });
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

export function createDispatchBin<D extends Driver>(realm: Realm, dispatcher: Dispatcher): DispatchBin<D> {
  return createDispatchBinBase(realm, dispatcher, false);
}
// #endregion

// #region OuterDispatchBin
export type OuterDispatchBin<D> = {
  readonly [K in keyof D as
  D[K] extends GenericReactor<any, AccessModifier.public> ? K
    : D[K] extends GenericSynthReactor<any, AccessModifier.public> ? K
      : never
  ]: DispatchBinItem<D[K]>;
};

export function createOuterDispatchBin<D extends Driver>(realm: Realm, dispatcher: Dispatcher): OuterDispatchBin<D> {
  return createDispatchBinBase(realm, dispatcher, true);
}
// #endregion
