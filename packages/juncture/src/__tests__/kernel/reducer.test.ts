/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Frame, FrameConfig } from '../../frame/frame';
import { Juncture } from '../../juncture';
import { isReducerDefinition, reducer } from '../../kernel/reducer';
import { createSchemaDefinition, Schema } from '../../kernel/schema';
import { jSymbols } from '../../symbols';

describe('reducer composer', () => {
  test('should create a ReducerDefinition by passing a Juncture instance and a reducer', () => {
    class MySchema extends Schema<string> {
      constructor() {
        super('');
      }
    }
    class MyFrame<J extends MyJuncture> extends Frame<J> { }
    class MyJuncture extends Juncture {
      schema = createSchemaDefinition(() => new MySchema());

      [jSymbols.createFrame] = (config: FrameConfig) => new MyFrame(this, config);

      aValue = 21;

      myReducer = reducer(this, () => {
        function fn(str: string): string;
        function fn(str: string, len?: number): string;
        function fn(str: string, len?: number) {
          return str as any + len as any;
        }
        return fn;
      });

      myRedeucer2 = reducer(this, ({ reduce }) => (val: string) => reduce().myReducer(val));
    }
    const myJuncture = new MyJuncture();
    expect(isReducerDefinition(myJuncture.myReducer)).toBe(true);
  });
});
