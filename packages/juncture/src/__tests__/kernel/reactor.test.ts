/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Frame, FrameConfig } from '../../frame/frame';
import { Juncture } from '../../juncture';
import { isReactorDefinition, reducer } from '../../kernel/reactor';
import { createSchemaDefinition, Schema } from '../../kernel/schema';
import { jSymbols } from '../../symbols';

describe('reducer composer', () => {
  test('should create a ReducerReactorDefinition by passing a Juncture instance and a reducer', () => {
    class MySchema extends Schema<string> {
      constructor() {
        super('');
      }
    }
    class MyFrame extends Frame<MyJuncture> { }
    class MyJuncture extends Juncture {
      schema = createSchemaDefinition(() => new MySchema());

      [jSymbols.createFrame] = (config: FrameConfig) => new MyFrame(this, config);

      prova = 21;

      myReactor = reducer(this, () => {
        function fn(str: string): string;
        function fn(str: string, len?: number): string;
        function fn(str: string, len?: number) {
          return str as any + len as any;
        }
        return fn;
      });

      myReactor2 = reducer(this, _ => () => {
        _.$DISPATCH.myReactor('');
        return _.$VALUE;
      });
    }
    const myJuncture = new MyJuncture();
    expect(isReactorDefinition(myJuncture.myReactor)).toBe(true);
  });
});
