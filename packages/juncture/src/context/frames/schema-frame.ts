/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Schema } from '../../definition/schema';

export interface OverrideSchemaFrame<X extends Schema> {
  readonly parent: X;
}
