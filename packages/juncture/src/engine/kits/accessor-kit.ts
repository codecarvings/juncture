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
  ApplyAccessor, createApplyAccessor, createInternalApplyAccessor, InternalApplyAccessor
} from '../equipment/accessors/apply-accessor';
import {
  createDispatchAccessor, createInternalDispatchAccessor, DispatchAccessor, InternalDispatchAccessor
} from '../equipment/accessors/dispatch-accessor';
import {
  createInternalSelectAccessor, createSelectAccessor, InternalSelectAccessor, SelectAccessor
} from '../equipment/accessors/select-accessor';
import {
  createInternalSourceAccessor, createSourceAccessor, InternalSourceAccessor, SourceAccessor
} from '../equipment/accessors/source-accessor';
import { Gear } from '../gear';
import { InternalBinKit } from './bin-kit';

// #region AccessorKit
export interface AccessorKit<J extends Juncture = Juncture> {
  readonly select: SelectAccessor<J>;
  readonly apply: ApplyAccessor<J>;
  readonly dispatch: DispatchAccessor<J>;
  readonly source: SourceAccessor<J>;
}

export function equipAccessorKit(accessors: any, gear: Gear) {
  defineLazyProperty(accessors, 'select', () => createSelectAccessor(gear));
  defineLazyProperty(accessors, 'apply', () => createApplyAccessor(gear));
  defineLazyProperty(accessors, 'dispatch', () => createDispatchAccessor(gear));
  defineLazyProperty(accessors, 'source', () => createSourceAccessor(gear));
}
// #endregion

// #region InternalAccessorKit
export interface InternalAccessorKit<J extends Juncture = Juncture> {
  readonly select: InternalSelectAccessor<J>;
  readonly apply: InternalApplyAccessor<J>;
  readonly dispatch: InternalDispatchAccessor<J>;
  readonly source: InternalSourceAccessor<J>;
}

export function equipInternalAccessorKit(accessors: any, gear: Gear, internalBins: InternalBinKit) {
  defineLazyProperty(accessors, 'select', () => createInternalSelectAccessor(gear, internalBins));
  defineLazyProperty(accessors, 'apply', () => createInternalApplyAccessor(gear, internalBins));
  defineLazyProperty(accessors, 'dispatch', () => createInternalDispatchAccessor(gear, internalBins));
  defineLazyProperty(accessors, 'source', () => createInternalSourceAccessor(gear));
}
// #endregion
