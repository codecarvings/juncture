/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import {
  createPrivateSelectAccessor, createSelectAccessor, PrivateSelectAccessor, SelectAccessor
} from '../accessors/select-accessor';
import { createValueAccessor, ValueAccessor } from '../accessors/value-accessor';
import { Ctx } from '../ctx';
import { PrivateBinKit } from './bin-kit';

// #region AccessorKit
export interface AccessorKit<J extends Juncture = Juncture> {
  readonly value: ValueAccessor<J>;
  readonly select: SelectAccessor<J>;
}

export function prepareAccessorKit(accessors: any, ctx: Ctx) {
  defineLazyProperty(accessors, 'value', () => createValueAccessor(ctx));
  defineLazyProperty(accessors, 'select', () => createSelectAccessor(ctx));
}
// #endregion

// #region PrivateAccessorKit
export interface PrivateAccessorKit<J extends Juncture = Juncture> {
  readonly value: ValueAccessor<J>;
  readonly select: PrivateSelectAccessor<J>;
}

export function preparePrivateAccessorKit(accessors: any, ctx: Ctx, privateBins: PrivateBinKit) {
  defineLazyProperty(accessors, 'value', () => createValueAccessor(ctx));
  defineLazyProperty(accessors, 'select', () => createPrivateSelectAccessor(ctx, privateBins));
}
// #endregion
