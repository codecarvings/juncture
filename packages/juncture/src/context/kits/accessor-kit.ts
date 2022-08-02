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
  createDispatchAccessor, createPrivateDispatchAccessor, DispatchAccessor, PrivateDispatchAccessor
} from '../accessors/dispatch-accessor';
import {
  createPrepareAccessor, createPrivatePrepareAccessor, PrepareAccessor, PrivatePrepareAccessor
} from '../accessors/prepare-accessor';
import {
  createPrivateReduceAccessor, createReduceAccessor, PrivateReduceAccessor, ReduceAccessor
} from '../accessors/reduce-accessor';
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
  readonly reduce: ReduceAccessor<J>;
  readonly prepare: PrepareAccessor<J>;
  readonly dispatch: DispatchAccessor<J>;
}

export function prepareAccessorKit(accessors: any, ctx: Ctx) {
  defineLazyProperty(accessors, 'value', () => createValueAccessor(ctx));
  defineLazyProperty(accessors, 'select', () => createSelectAccessor(ctx));
  defineLazyProperty(accessors, 'reduce', () => createReduceAccessor(ctx));
  defineLazyProperty(accessors, 'prepare', () => createPrepareAccessor(ctx));
  defineLazyProperty(accessors, 'dispatch', () => createDispatchAccessor(ctx));
}
// #endregion

// #region PrivateAccessorKit
export interface PrivateAccessorKit<J extends Juncture = Juncture> {
  readonly value: ValueAccessor<J>;
  readonly select: PrivateSelectAccessor<J>;
  readonly reduce: PrivateReduceAccessor<J>;
  readonly prepare: PrivatePrepareAccessor<J>;
  readonly dispatch: PrivateDispatchAccessor<J>;
}

export function preparePrivateAccessorKit(accessors: any, ctx: Ctx, privateBins: PrivateBinKit) {
  defineLazyProperty(accessors, 'value', () => createValueAccessor(ctx));
  defineLazyProperty(accessors, 'select', () => createPrivateSelectAccessor(ctx, privateBins));
  defineLazyProperty(accessors, 'reduce', () => createPrivateReduceAccessor(ctx, privateBins));
  defineLazyProperty(accessors, 'prepare', () => createPrivatePrepareAccessor(ctx, privateBins));
  defineLazyProperty(accessors, 'dispatch', () => createPrivateDispatchAccessor(ctx, privateBins));
}
// #endregion
