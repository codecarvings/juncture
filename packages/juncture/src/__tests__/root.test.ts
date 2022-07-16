/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { jBit } from '../lib/bit';
import { Root } from '../root';

// TODO
test('Bit', () => {
  class MyBit extends jBit.settable.Of('') {
    len = this.DEF.selector(({ value }) => value().length);
  }

  const root = new Root(MyBit, 'my-loaded-state');
  // root.context.dispach(root.context._).set('sfds');
});
