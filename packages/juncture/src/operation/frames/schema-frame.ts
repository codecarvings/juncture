/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { JunctureSchema } from '../../schema';

export interface OverrideSchemaFrame<X extends JunctureSchema> {
  readonly parent: X;
}