/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchemaDef, Schema } from '../../definition/schema';
import { Frame, FrameConfig } from '../../frame/frame';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';

describe('Frame class', () => {
  class MySchema extends Schema<string> {
    constructor() {
      super('');
    }
  }
  class MyFrame<J extends MyJuncture> extends Frame<J> { }
  class MyJuncture extends Juncture {
    schema = createSchemaDef(() => new MySchema());

    [jSymbols.createFrame] = (config: FrameConfig) => new MyFrame(this, config);
  }
  const juncture = Juncture.getInstance(MyJuncture);
  const config: FrameConfig = {
    layout: {
      parent: null,
      path: [],
      isDivergent: false,
      isUnivocal: true
    }
  };

  test('should be instantiable by passing a juncture and a FrameConfig object', () => {
    const frame = new MyFrame(juncture, config);
    expect(frame).toBeInstanceOf(MyFrame);
  });

  describe('instance', () => {
    let frame: MyFrame<MyJuncture>;
    beforeEach(() => {
      frame = new MyFrame(juncture, config);
    });

    test('should have a "juncture" property containing the same value of the provided juncture', () => {
      expect(frame.juncture).toBe(juncture);
    });

    test('should have a "layout" property containing the same value of the provided config', () => {
      expect(frame.layout).toBe(config.layout);
    });
  });

  // describe('static', () => {
  //   test('should have a get method that return the original Frame from a FrameHost', () => {
  //     const frame = new MyFrame(juncture, config);
  //     const cursor: FrameHost<MyJuncture> = {
  //       [jSymbols.frame]: frame
  //     };
  //     expect(Frame.get(cursor)).toBe(frame);

  //     const cursor2: FrameHost<MyJuncture> = {
  //       [jSymbols.frame]: null!
  //     };
  //     expect(Frame.get(cursor2)).toBeNull();
  //   });
  // });
});
