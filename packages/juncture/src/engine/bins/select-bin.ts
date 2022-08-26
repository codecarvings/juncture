/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access';
import { Descriptor, getFilteredDescriptorKeys } from '../../design/descriptor';
import { DescriptorType, NotSuitableType, selectableDescriptorTypes } from '../../design/descriptor-type';
import { GenericParamSelector } from '../../design/descriptors/param-selector';
import { GenericSelector } from '../../design/descriptors/selector';
import { Driver } from '../../driver';
import { jSymbols } from '../../symbols';
import { defineLazyProperty } from '../../tool/object';
import { DefaultFrameHost } from '../frames/frame';
import { Gear } from '../gear';

// #region Common
type SelectBinItem<L> =
  L extends GenericSelector<infer B, any> ? B
    : L extends GenericParamSelector<infer B, any> ? B
      : NotSuitableType;

function createSelectBinBase<D extends Driver>(gear: Gear, frameHost: DefaultFrameHost<D>, outerFilter: boolean) {
  const { driver } = gear;
  const keys = getFilteredDescriptorKeys(driver, selectableDescriptorTypes, outerFilter);
  const bin: any = {};
  keys.forEach(key => {
    const desc: Descriptor<any, any, any> = (driver as any)[key];
    if (desc.type === DescriptorType.selector) {
      Object.defineProperty(bin, key, {
        get: () => desc[jSymbols.payload](frameHost.default)
      });
    } else {
      defineLazyProperty(
        bin,
        key,
        () => (...args: any) => desc[jSymbols.payload](frameHost.default)(...args)
      );
    }
  });
  return bin;
}
// #endregion

// #region SelectBin
// Conditional type required as a workoaround for problems with key remapping
export type SelectBin<D> = D extends any ? {
  // readonly [K in keyof D as D[K] extends Selector<any, any> ? K : never]: SelectBinItem<D[K]>;
  readonly [K in keyof D as K extends string ? K : never]: SelectBinItem<D[K]>;
} : never;

export interface SelectBinHost<D> {
  readonly select: SelectBin<D>;
}

export function createSelectBin<D extends Driver>(
  gear: Gear,
  frameHost: DefaultFrameHost<D>
): SelectBin<D> {
  return createSelectBinBase(gear, frameHost, false);
}
// #endregion

// #region OuterSelectBin
export type OuterSelectBin<D> = {
  readonly [K in keyof D as
  D[K] extends GenericSelector<any, AccessModifier.public> ? K
    : D[K] extends GenericParamSelector<any, AccessModifier.public> ? K
      : never
  ]: SelectBinItem<D[K]>;
};

export function createOuterSelectBin<D extends Driver>(
  gear: Gear,
  frameHost: DefaultFrameHost<D>
): OuterSelectBin<D> {
  return createSelectBinBase(gear, frameHost, true);
}
// #endregion
