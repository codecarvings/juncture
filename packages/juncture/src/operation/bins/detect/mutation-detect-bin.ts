/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { AccessModifier } from '../../../access-modifier';
import { DescriptorKeyPrefix } from '../../../design/descriptor-type';
import { GenericParamSelector } from '../../../design/descriptors/param-selector';
import { GenericSelector } from '../../../design/descriptors/selector';
import { OverloadParameters, OverloadReturnType } from '../../../utilities/overload-types';

// #region Common
type MutationDetectBinItem<L> =
  L extends GenericSelector<infer B, any> ? Observable<B>
    : L extends GenericParamSelector<infer B, any> ?
      (...args : OverloadParameters<B>) => Observable<OverloadReturnType<B>>
      : never;
// #endregion

// #region MutationDetectBin
export type MutationDetectBin<D> = D extends any ? {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.selector}.${infer W}` ? W : never]:
  MutationDetectBinItem<D[K]>;
} : never;

export interface MutationDetectBinHost<D> {
  readonly mutation: MutationDetectBin<D>;
}
// #endregion

// #region XpMutationDetectBin
type XpMutationDetectBinKey<L, K> =
  L extends GenericSelector<any, AccessModifier.public> ? K
    : L extends GenericParamSelector<any, AccessModifier.public> ? K
      : never;

export type XpMutationDetectBin<D> = {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.selector}.${infer W}` ?
    XpMutationDetectBinKey<D[K], W> : never]: MutationDetectBinItem<D[K]>;
};
// #endregion
