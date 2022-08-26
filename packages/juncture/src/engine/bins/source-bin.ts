/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access';
import { Descriptor, getFilteredDescriptorKeys } from '../../design/descriptor';
import { NotSuitableType, observableDescriptorTypes } from '../../design/descriptor-type';
import { GenericParamSelector, ParamSelectorObservables } from '../../design/descriptors/param-selector';
import { GenericSelector, SelectorObservables } from '../../design/descriptors/selector';
import { Driver } from '../../driver';
import { Gear } from '../gear';

// #region Common
type SourceBinItem<L> =
  L extends GenericSelector<infer B, any> ? SelectorObservables<B>
    : L extends GenericParamSelector<infer B, any> ? ParamSelectorObservables<B>
      : NotSuitableType;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createSourceBinBase<D extends Driver>(gear: Gear, outerFilter: boolean) {
  const { driver } = gear;
  const keys = getFilteredDescriptorKeys(driver, observableDescriptorTypes, outerFilter);
  const bin: any = {};
  keys.forEach(key => {
    const desc: Descriptor<any, any, any> = (driver as any)[key];
  });
  return bin;
}
// #endregion

// #region SourceBin
export type SourceBin<D> = D extends any ? {
  readonly [K in keyof D as K extends string ? K : never]: SourceBinItem<D[K]>;
} : never;

export interface SourceBinHost<D> {
  readonly source: SourceBin<D>;
}

export function createSourceBin<D extends Driver>(
  gear: Gear
): SourceBin<D> {
  return createSourceBinBase(gear, false);
}
// #endregion

// #region OuterSourceBin
export type OuterSourceBin<D> = {
  readonly [K in keyof D as
  D[K] extends GenericSelector<any, AccessModifier.public> ? K
    : D[K] extends GenericParamSelector<any, AccessModifier.public> ? K
      : never
  ]: SourceBinItem<D[K]>;
};

export function createOuterSourceBin<D extends Driver>(
  gear: Gear
): OuterSourceBin<D> {
  return createSourceBinBase(gear, true);
}
// #endregion
