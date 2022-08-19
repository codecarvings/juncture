/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../design/access-modifier';
import { Descriptor, getFilteredDescriptorKeys } from '../../design/descriptor';
import { DescriptorType, NotSuitableType, selectableDescriptorTypes } from '../../design/descriptor-type';
import { GenericParamSelector } from '../../design/descriptors/param-selector';
import { GenericSelector } from '../../design/descriptors/selector';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';
import { defineLazyProperty } from '../../tool/object';
import { InternalFrameHost } from '../frames/internal-frame';
import { Gear } from '../gear';

// #region Common
type SelectBinItem<D> =
  D extends GenericSelector<infer B, any> ? B
    : D extends GenericParamSelector<infer B, any> ? B
      : NotSuitableType;

function createSelectBinBase<J extends Juncture>(
  gear: Gear,
  internalFrameHost: InternalFrameHost<J>,
  internalUse: boolean
) {
  const { juncture } = gear;
  const keys = getFilteredDescriptorKeys(juncture, selectableDescriptorTypes, internalUse);
  const bin: any = {};
  keys.forEach(key => {
    const desc: Descriptor<any, any, any> = (juncture as any)[key];
    if (desc.type === DescriptorType.selector) {
      Object.defineProperty(bin, key, {
        get: () => desc[jSymbols.payload](internalFrameHost.internal)
      });
    } else {
      defineLazyProperty(
        bin,
        key,
        () => (...args: any) => desc[jSymbols.payload](internalFrameHost.internal)(...args)
      );
    }
  });
  return bin;
}
// #endregion

// #region SelectBin
export type SelectBin<J> = {
  readonly [K in keyof J as
  J[K] extends GenericSelector<any, AccessModifier.public> ? K
    : J[K] extends GenericParamSelector<any, AccessModifier.public> ? K
      : never
  ]: SelectBinItem<J[K]>;
};

export function createSelectBin<J extends Juncture>(
  gear: Gear,
  internalFrameHost: InternalFrameHost<J>
): SelectBin<J> {
  return createSelectBinBase(gear, internalFrameHost, false);
}
// #endregion

// #region InternalSelectBin
// Conditional type required as a workoaround for problems with key remapping
export type InternalSelectBin<J> = J extends any ? {
  // readonly [K in keyof J as J[K] extends Selector<any, any> ? K : never]: SelectBinItem<J[K]>;
  readonly [K in keyof J as K extends string ? K : never]: SelectBinItem<J[K]>;
} : never;

export interface InternalSelectBinHost<J> {
  readonly select: InternalSelectBin<J>;
}

export function createInternalSelectBin<J extends Juncture>(
  gear: Gear,
  internalFrameHost: InternalFrameHost<J>
): InternalSelectBin<J> {
  return createSelectBinBase(gear, internalFrameHost, true);
}
// #endregion
