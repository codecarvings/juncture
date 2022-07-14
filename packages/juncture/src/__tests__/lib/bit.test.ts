/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { bit } from '../../lib/bit';

// TODO
test('Bit', () => {
  class Test extends bit.string {
    count = this.DEF.selector(({ value }) => value().length);
  }
});
