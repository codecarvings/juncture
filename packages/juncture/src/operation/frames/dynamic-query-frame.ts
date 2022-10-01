/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DynamicQuery } from '../../queries/dynamic-query';
import { DynamicQueryCursor } from '../frame-equipment/dynamic-query-cursor';
import { UnbindedFrame } from './unbinded-frame';

export interface DynamicQueryFrame<Q extends DynamicQuery> extends UnbindedFrame {
  readonly _: DynamicQueryCursor<Q>;
}
