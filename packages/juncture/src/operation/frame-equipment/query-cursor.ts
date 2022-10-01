/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, XpCursorOf } from '../../juncture';
import { Query, QueryItem, QueryJunctureRequest } from '../../queries/query';

type QueryCursorItem<I extends QueryItem> =
  I extends Juncture ? XpCursorOf<I> :
    I extends QueryJunctureRequest<infer J> ?
      (I extends { optional : true } ? XpCursorOf<J> | undefined : XpCursorOf<J>) :
      never;

export type QueryCursor<Q extends Query> = {
  readonly [K in keyof Q]: QueryCursorItem<Q[K]>;
};
