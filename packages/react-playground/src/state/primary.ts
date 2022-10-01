/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BIT, STRUCT } from '@codecarvings/juncture';

export class Primary extends STRUCT.of({
  name: BIT.of('Hello World from Juncture!')
}) { }
