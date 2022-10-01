/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, XpCursorOf } from '../../juncture';
import {
    DynamicQuery,
    DynamicQueryJunctureRequest, DynamicQueryTemporaryJunctureRequest
} from '../../queries/dynamic-query';

type DynamicCursorItem<I> =
  I extends Juncture ? XpCursorOf<I> :
    I extends DynamicQueryJunctureRequest<infer J> ?
      (I extends { optional : true } ? XpCursorOf<J> | undefined : XpCursorOf<J>) :
      I extends DynamicQueryTemporaryJunctureRequest<infer J> ? XpCursorOf<J> :
        never;

export type DynamicQueryCursor<Q extends DynamicQuery> = {
  readonly [K in keyof Q]: DynamicCursorItem<Q[K]>;
};
