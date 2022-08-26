/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import { defineLazyProperty } from '../../tool/object';
import {
  ApplyAccessor, createApplyAccessor, createOuterApplyAccessor, OuterApplyAccessor
} from '../frame-equipment/accessors/apply-accessor';
import {
  createDispatchAccessor, createOuterDispatchAccessor, DispatchAccessor, OuterDispatchAccessor
} from '../frame-equipment/accessors/dispatch-accessor';
import {
  createOuterSelectAccessor, createSelectAccessor, OuterSelectAccessor, SelectAccessor
} from '../frame-equipment/accessors/select-accessor';
import {
  createOuterSourceAccessor, createSourceAccessor, OuterSourceAccessor, SourceAccessor
} from '../frame-equipment/accessors/source-accessor';
import { Gear } from '../gear';
import { BinKit } from './bin-kit';

// #region AccessorKit
export interface AccessorKit<D extends Driver = Driver> {
  readonly select: SelectAccessor<D>;
  readonly apply: ApplyAccessor<D>;
  readonly dispatch: DispatchAccessor<D>;
  readonly source: SourceAccessor<D>;
}

export function prepareAccessorKit(accessors: any, gear: Gear, bins: BinKit) {
  defineLazyProperty(accessors, 'select', () => createSelectAccessor(gear, bins));
  defineLazyProperty(accessors, 'apply', () => createApplyAccessor(gear, bins));
  defineLazyProperty(accessors, 'dispatch', () => createDispatchAccessor(gear, bins));
  defineLazyProperty(accessors, 'source', () => createSourceAccessor(gear));
}
// #endregion

// #region OuterAccessorKit
export interface OuterAccessorKit<D extends Driver = Driver> {
  readonly select: OuterSelectAccessor<D>;
  readonly apply: OuterApplyAccessor<D>;
  readonly dispatch: OuterDispatchAccessor<D>;
  readonly source: OuterSourceAccessor<D>;
}

export function prepareOuterAccessorKit(accessors: any, gear: Gear) {
  defineLazyProperty(accessors, 'select', () => createOuterSelectAccessor(gear));
  defineLazyProperty(accessors, 'apply', () => createOuterApplyAccessor(gear));
  defineLazyProperty(accessors, 'dispatch', () => createOuterDispatchAccessor(gear));
  defineLazyProperty(accessors, 'source', () => createOuterSourceAccessor(gear));
}
// #endregion
