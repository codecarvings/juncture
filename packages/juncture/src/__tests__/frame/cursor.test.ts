/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchemaDef, Schema } from '../../definition/schema';
import { createCursor, getFrame, isCursor } from '../../frame/cursor';
import { Frame, FrameConfig } from '../../frame/frame';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';

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
const frame1 = new MyFrame(juncture, config);
const frame2 = new MyFrame(juncture, config);

describe('createCursor', () => {
  test('should create a cursor by passing a frame', () => {
    const cursor = createCursor(frame1);
    expect(isCursor(cursor)).toBe(true);
  });

  test('should create a cursor associated with the original frame', () => {
    const cursor = createCursor(frame1);

    expect(isCursor(cursor, frame1)).toBe(true);
    expect(isCursor(cursor, frame2)).toBe(false);
  });
});

describe('getFrame', () => {
  test('should return the frame associated to the cursor', () => {
    const cursor1 = createCursor(frame1);
    const cursor2 = createCursor(frame2);

    expect(getFrame(cursor1)).toBe(frame1);
    expect(getFrame(cursor2)).toBe(frame2);
  });
});

describe('isCursor', () => {
  describe('when no "frame" argument is provided', () => {
    test('should return true if object is a cursor', () => {
      const cursor = createCursor(frame1);
      expect(isCursor(cursor)).toBe(true);
    });
    test('should return false if object is not a cursor', () => {
      expect(isCursor('a-string')).toBe(false);
      expect(isCursor(1)).toBe(false);
      expect(isCursor(true)).toBe(false);
      expect(isCursor(undefined)).toBe(false);
      expect(isCursor(null)).toBe(false);
    });
  });

  describe('when "frame" argument is provided', () => {
    test('should return true if object is a cursor associated with the provided frame', () => {
      const cursor = createCursor(frame1);
      expect(isCursor(cursor, frame1)).toBe(true);
    });
    test('should return false if object is not a cursor associated with the provided frame', () => {
      const cursor = createCursor(frame1);
      expect(isCursor(cursor, frame2)).toBe(false);
    });
    test('should return false if object is not a cursor', () => {
      expect(isCursor('a-string', frame1)).toBe(false);
      expect(isCursor(1, frame1)).toBe(false);
      expect(isCursor(true, frame1)).toBe(false);
      expect(isCursor(undefined, frame1)).toBe(false);
      expect(isCursor(null, frame1)).toBe(false);
    });
  });
});
