/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSelectAccessor, SelectAccessor } from '../../frame/accessors/select-accessor';
import { createValueAccessor, ValueAccessor } from '../../frame/accessors/value-accessor';
import { Juncture } from '../../juncture';
import { defineLazyProperty } from '../../util/object';
import { Ctx } from '../ctx';
import { PrivateBinKit } from './private-bin-kit';

export interface AccessorKit<J extends Juncture = Juncture> {
  readonly value: ValueAccessor<J>;
  readonly select: SelectAccessor<J>;
}

export function prepareAccessorKit(accessors: any, ctx: Ctx, privateBins: PrivateBinKit) {
  defineLazyProperty(accessors, 'value', () => createValueAccessor(ctx));
  defineLazyProperty(accessors, 'select', () => createSelectAccessor(ctx, privateBins));
}
