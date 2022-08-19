/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../design/access-modifier';
import { NotSuitableType } from '../../design/descriptor-type';
import { GenericParamSelector, ParamSelectorObservables } from '../../design/descriptors/param-selector';
import { GenericSelector, SelectorObservables } from '../../design/descriptors/selector';
import { Juncture } from '../../juncture';
import { Gear } from '../gear';

// #region Common
type SourceBinItem<D> =
  D extends GenericSelector<infer B, any> ? SelectorObservables<B>
    : D extends GenericParamSelector<infer B, any> ? ParamSelectorObservables<B>
      : NotSuitableType;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createSourceBinBase<J extends Juncture>(gear: Gear, internalUse: boolean) {
  const bin: any = {};
  return bin;
}
// #endregion

// #region SourceBin
export type SourceBin<J> = {
  readonly [K in keyof J as
  J[K] extends GenericSelector<any, AccessModifier.public> ? K
    : J[K] extends GenericParamSelector<any, AccessModifier.public> ? K
      : never
  ]: SourceBinItem<J[K]>;
};

export function createSourceBin<J extends Juncture>(
  gear: Gear
): SourceBin<J> {
  return createSourceBinBase(gear, false);
}
// #endregion

// #region InternalSourceBin
export type InternalSourceBin<J> = J extends any ? {
  readonly [K in keyof J as K extends string ? K : never]: SourceBinItem<J[K]>;
} : never;

export interface InternalSourceBinHost<J> {
  readonly source: InternalSourceBin<J>;
}

export function createInternalSourceBin<J extends Juncture>(
  gear: Gear
): InternalSourceBin<J> {
  return createSourceBinBase(gear, true);
}
// #endregion
