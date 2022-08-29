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
import { createOuterEmitAccessor, EmitAccessor, OuterEmitAccessor } from '../frame-equipment/accessors/emit-accessor';
import {
  createOuterSelectAccessor, createSelectAccessor, OuterSelectAccessor, SelectAccessor
} from '../frame-equipment/accessors/select-accessor';
import {
  createOuterTriggerAccessor, createTriggerAccessor, OuterTriggerAccessor, TriggerAccessor
} from '../frame-equipment/accessors/trigger-accessor';
import { Realm } from '../realm';
import { BinKit } from './bin-kit';

// #region AccessorKit
export interface AccessorKit<D extends Driver = Driver> {
  readonly select: SelectAccessor<D>;
  readonly apply: ApplyAccessor<D>;
  readonly dispatch: DispatchAccessor<D>;
  readonly emit: EmitAccessor<D>;
  readonly trigger: TriggerAccessor<D>;
}

export function prepareAccessorKit(accessors: any, realm: Realm, bins: BinKit) {
  defineLazyProperty(accessors, 'select', () => createSelectAccessor(realm, bins));
  defineLazyProperty(accessors, 'apply', () => createApplyAccessor(realm, bins));
  defineLazyProperty(accessors, 'dispatch', () => createDispatchAccessor(realm, bins));
  defineLazyProperty(accessors, 'emit', () => createDispatchAccessor(realm, bins));
  defineLazyProperty(accessors, 'trigger', () => createTriggerAccessor(realm));
}
// #endregion

// #region OuterAccessorKit
export interface OuterAccessorKit<D extends Driver = Driver> {
  readonly select: OuterSelectAccessor<D>;
  readonly apply: OuterApplyAccessor<D>;
  readonly dispatch: OuterDispatchAccessor<D>;
  readonly emit: OuterEmitAccessor<D>;
  readonly trigger: OuterTriggerAccessor<D>;
}

export function prepareOuterAccessorKit(accessors: any, realm: Realm) {
  defineLazyProperty(accessors, 'select', () => createOuterSelectAccessor(realm));
  defineLazyProperty(accessors, 'apply', () => createOuterApplyAccessor(realm));
  defineLazyProperty(accessors, 'dispatch', () => createOuterDispatchAccessor(realm));
  defineLazyProperty(accessors, 'emit', () => createOuterEmitAccessor(realm));
  defineLazyProperty(accessors, 'trigger', () => createOuterTriggerAccessor(realm));
}
// #endregion
