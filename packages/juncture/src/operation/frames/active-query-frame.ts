/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ActiveQuery } from '../../query/active-query';
import { ActiveQueryCursor } from '../frame-equipment/active-query-cursor';
import { createUniFrame, UniFrame } from './uni-frame';

export interface ActiveQueryFrame<Q extends ActiveQuery> extends UniFrame {
  readonly _: ActiveQueryCursor<Q>;
}

export const createActiveQueryFrame: <Q extends ActiveQuery>(
  cursor: ActiveQueryCursor<Q>
) => ActiveQueryFrame<Q> = createUniFrame;
