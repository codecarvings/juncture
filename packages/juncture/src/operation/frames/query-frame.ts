/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Query } from '../../query/query';
import { QueryCursor } from '../frame-equipment/query-cursor';
import { UnboundFrame } from './unbound-frame';

export interface QueryFrame<Q extends Query> extends UnboundFrame {
  readonly _: QueryCursor<Q>;
}
