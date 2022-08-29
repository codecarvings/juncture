/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { AccessModifier } from '../../access';
import { Descriptor, getFilteredDescriptorKeys } from '../../design/descriptor';
import { descriptorTypeFamilies, NotSuitableType } from '../../design/descriptor-type';
import { GenericChannel } from '../../design/descriptors/channel';
import { OpenChannel } from '../../design/descriptors/open-channel';
import { GenericParamSelector, ParamSelectorObservables } from '../../design/descriptors/param-selector';
import { GenericSelector, SelectorObservables } from '../../design/descriptors/selector';
import { Driver } from '../../driver';
import { Realm } from '../realm';

// #region Common
type TriggerBinItem<L> =
  L extends GenericChannel<infer B, any> ? Observable<B>
    : L extends OpenChannel<infer B> ? Observable<B>
      : L extends GenericSelector<infer B, any> ? SelectorObservables<B>
        : L extends GenericParamSelector<infer B, any> ? ParamSelectorObservables<B>
          : NotSuitableType;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createTriggerBinBase<D extends Driver>(realm: Realm, outerFilter: boolean) {
  const { driver } = realm;
  const keys = getFilteredDescriptorKeys(driver, descriptorTypeFamilies.observable, outerFilter);
  const bin: any = {};
  keys.forEach(key => {
    const desc: Descriptor<any, any, any> = (driver as any)[key];
  });
  return bin;
}
// #endregion

// #region TriggerBin
export type TriggerBin<D> = D extends any ? {
  readonly [K in keyof D as K extends string ? K : never]: TriggerBinItem<D[K]>;
} : never;

export interface TriggerBinHost<D> {
  readonly trigger: TriggerBin<D>;
}

export function createTriggerBin<D extends Driver>(realm: Realm): TriggerBin<D> {
  return createTriggerBinBase(realm, false);
}
// #endregion

// #region OuterTriggerBin
export type OuterTriggerBin<D> = {
  readonly [K in keyof D as
  D[K] extends GenericSelector<any, AccessModifier.public> ? K
    : D[K] extends GenericParamSelector<any, AccessModifier.public> ? K
      : never
  ]: TriggerBinItem<D[K]>;
};

export function createOuterTriggerBin<D extends Driver>(realm: Realm): OuterTriggerBin<D> {
  return createTriggerBinBase(realm, true);
}
// #endregion
