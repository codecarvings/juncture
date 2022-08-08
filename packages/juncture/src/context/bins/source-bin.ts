/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefAccess } from '../../definition/def';
import { ParamSelectorDef } from '../../definition/param-selector';
import { SelectorDef } from '../../definition/selector';
import { Juncture } from '../../juncture';
import { Ctx } from '../ctx';

// #region Common
type SourceBinItem<D> = D;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createSourceBinBase<J extends Juncture>(ctx: Ctx, internalUse: boolean) {
  const bin: any = {};
  return bin;
}
// #endregion

// #region SourceBin
export type SourceBin<J> = {
  readonly [K in keyof J as
  J[K] extends SelectorDef<any, DefAccess.public> ? K
    : J[K] extends ParamSelectorDef<any, DefAccess.public> ? K
      : never
  ]: SourceBinItem<J[K]>;
};

export function createSourceBin<J extends Juncture>(
  ctx: Ctx
): SourceBin<J> {
  return createSourceBinBase(ctx, false);
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
  ctx: Ctx
): InternalSourceBin<J> {
  return createSourceBinBase(ctx, true);
}
// #endregion
