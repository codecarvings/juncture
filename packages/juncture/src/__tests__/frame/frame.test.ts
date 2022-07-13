/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchemaDef, Schema } from '../../definition/schema';
import { isCursor } from '../../frame/cursor';
import { Frame, FrameConfig } from '../../frame/frame';
import { Juncture } from '../../juncture';

describe('Frame class', () => {
  class MySchema extends Schema<string> {
    constructor() {
      super('');
    }
  }
  class MyJuncture extends Juncture {
    schema = createSchemaDef(() => new MySchema());
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
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const frame = new Frame(juncture, config);
    }).not.toThrow();
  });

  describe('instance', () => {
    let frame: Frame<MyJuncture>;
    beforeEach(() => {
      frame = new Frame(juncture, config);
    });

    test('should have a "juncture" property containing a reference to the original Juncture', () => {
      expect(frame.juncture).toBe(juncture);
    });

    test('should have a "layout" property containing the same value of the provided config', () => {
      expect(frame.layout).toBe(config.layout);
    });

    // eslint-disable-next-line max-len
    test('should have a "privateCursor" property that give access to a private cursor associated with the frame', () => {
      expect(isCursor(frame.privateCursor, frame)).toBe(true);
    });

    test('should have a "cursor" property that give access to a cursor associated with the frame', () => {
      expect(isCursor(frame.cursor, frame)).toBe(true);
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
