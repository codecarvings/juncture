/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchemaDef, Schema } from '../../definition/schema';
import { Juncture } from '../../juncture';

// TODO
test('Bit', () => {
  // class Test extends Bit {
  //   mySel = this.DEF.selector(() => '123');
  // }

  // class Test2 extends Test {
  //   myVal = this.DEF.override(super.mySel);
  // }

  class Test extends Juncture {
    schema = createSchemaDef(() => new Schema({
      name: ''
    }));

    sel1 = this.DEF.selector(({ value }) => value());
  }

  class Test2 extends Test {
    schema = createSchemaDef(() => new Schema({
      name: '',
      surname: ''
    }));
  }
});
