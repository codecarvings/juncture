/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, XpCursorOf } from '../../juncture';
import { ActiveQuery, ActiveQueryRequest, ActiveQueryRunRequest } from '../../query/active-query';

type ActiveCursorItem<I> =
  I extends Juncture ? XpCursorOf<I> :
    I extends ActiveQueryRequest<infer J> ?
      (I extends { optional : true } ? XpCursorOf<J> | undefined : XpCursorOf<J>) :
      I extends ActiveQueryRunRequest<infer J> ? XpCursorOf<J> :
        never;

export type ActiveQueryCursor<Q extends ActiveQuery> = {
  readonly [K in keyof Q]: ActiveCursorItem<Q[K]>;
};

export interface ControlledActiveQueryCursor<Q extends ActiveQuery = ActiveQuery> {
  readonly cursor: ActiveQueryCursor<Q>;
  release(): void;
}
