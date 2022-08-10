/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
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
import { Gear } from '../gear';
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

export function equipAccessorKit(accessors: any, gear: Gear) {
  defineLazyProperty(accessors, 'value', () => createValueAccessor(gear));
  defineLazyProperty(accessors, 'select', () => createSelectAccessor(gear));
  defineLazyProperty(accessors, 'reduce', () => createReduceAccessor(gear));
  defineLazyProperty(accessors, 'prepare', () => createPrepareAccessor(gear));
  defineLazyProperty(accessors, 'dispatch', () => createDispatchAccessor(gear));
  defineLazyProperty(accessors, 'source', () => createSourceAccessor(gear));
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

export function equipInternalAccessorKit(accessors: any, gear: Gear, internalBins: InternalBinKit) {
  defineLazyProperty(accessors, 'value', () => createValueAccessor(gear));
  defineLazyProperty(accessors, 'select', () => createInternalSelectAccessor(gear, internalBins));
  defineLazyProperty(accessors, 'reduce', () => createInternalReduceAccessor(gear, internalBins));
  defineLazyProperty(accessors, 'prepare', () => createInternalPrepareAccessor(gear, internalBins));
  defineLazyProperty(accessors, 'dispatch', () => createInternalDispatchAccessor(gear, internalBins));
  defineLazyProperty(accessors, 'source', () => createInternalSourceAccessor(gear));
}
// #endregion
