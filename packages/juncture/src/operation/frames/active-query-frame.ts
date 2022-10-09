/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ActiveQuery } from '../../query/active-query';
import { ActiveQueryCursor } from '../frame-equipment/active-query-cursor';
import { UnboundFrame } from './unbound-frame';

export interface ActiveQueryFrame<Q extends ActiveQuery> extends UnboundFrame {
  readonly _: ActiveQueryCursor<Q>;
}
