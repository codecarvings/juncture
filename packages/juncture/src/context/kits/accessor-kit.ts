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
  createDispatchAccessor, createInternalDispatchAccessor, DispatchAccessor, InternalDispatchAccessor
} from '../accessors/dispatch-accessor';
import {
  createInternalPrepareAccessor, createPrepareAccessor, InternalPrepareAccessor, PrepareAccessor
} from '../accessors/prepare-accessor';
import {
  createInternalReduceAccessor, createReduceAccessor, InternalReduceAccessor, ReduceAccessor
} from '../accessors/reduce-accessor';
import {
  createInternalSelectAccessor, createSelectAccessor, InternalSelectAccessor, SelectAccessor
} from '../accessors/select-accessor';
import {
  createInternalSourceAccessor, createSourceAccessor, InternalSourceAccessor, SourceAccessor
} from '../accessors/source-accessor';
import { createValueAccessor, ValueAccessor } from '../accessors/value-accessor';
import { Ctx } from '../ctx';
import { InternalBinKit } from './bin-kit';

// #region AccessorKit
export interface AccessorKit<J extends Juncture = Juncture> {
  readonly value: ValueAccessor<J>;
  readonly select: SelectAccessor<J>;
  readonly reduce: ReduceAccessor<J>;
  readonly prepare: PrepareAccessor<J>;
  readonly dispatch: DispatchAccessor<J>;
  readonly source: SourceAccessor<J>;
}

export function equipAccessorKit(accessors: any, ctx: Ctx) {
  defineLazyProperty(accessors, 'value', () => createValueAccessor(ctx));
  defineLazyProperty(accessors, 'select', () => createSelectAccessor(ctx));
  defineLazyProperty(accessors, 'reduce', () => createReduceAccessor(ctx));
  defineLazyProperty(accessors, 'prepare', () => createPrepareAccessor(ctx));
  defineLazyProperty(accessors, 'dispatch', () => createDispatchAccessor(ctx));
  defineLazyProperty(accessors, 'source', () => createSourceAccessor(ctx));
}
// #endregion

// #region InternalAccessorKit
export interface InternalAccessorKit<J extends Juncture = Juncture> {
  readonly value: ValueAccessor<J>;
  readonly select: InternalSelectAccessor<J>;
  readonly reduce: InternalReduceAccessor<J>;
  readonly prepare: InternalPrepareAccessor<J>;
  readonly dispatch: InternalDispatchAccessor<J>;
  readonly source: InternalSourceAccessor<J>;
}

export function equipInternalAccessorKit(accessors: any, ctx: Ctx, internalBins: InternalBinKit) {
  defineLazyProperty(accessors, 'value', () => createValueAccessor(ctx));
  defineLazyProperty(accessors, 'select', () => createInternalSelectAccessor(ctx, internalBins));
  defineLazyProperty(accessors, 'reduce', () => createInternalReduceAccessor(ctx, internalBins));
  defineLazyProperty(accessors, 'prepare', () => createInternalPrepareAccessor(ctx, internalBins));
  defineLazyProperty(accessors, 'dispatch', () => createInternalDispatchAccessor(ctx, internalBins));
  defineLazyProperty(accessors, 'source', () => createInternalSourceAccessor(ctx));
}
// #endregion
