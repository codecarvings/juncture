/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ActiveQuery } from '../../query/active-query';
import { ActiveQueryCursor } from './active-query-cursor';

export class ControlledActiveQueryCursor<Q extends ActiveQuery> {
  readonly cursor: ActiveQueryCursor<Q> = {} as any;
}
