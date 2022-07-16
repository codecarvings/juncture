/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jBit } from '../../lib/bit';

// TODO
test('Bit', () => {
  class MyBit extends jBit.Of({ length: 0 }) {
    len = this.DEF.selector(({ value }) => value().length);
  }
});
