/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Frame, FrameConfig } from '../../frame/frame';
import { Juncture } from '../../juncture';
import { createDef, DefKind } from '../../kernel/def';
import { createMixReducerDef, createPlainReducerDef, isMixReducerDef, isPlainReducerDef, mixReducer, reducer, ReducerDefSubKind } from '../../kernel/reducer';
import { createSchemaDef, Schema } from '../../kernel/schema';
import { jSymbols } from '../../symbols';

describe('createPlainReducerDef', () => {
  test('should create a PlainReducerDefn by passing a reducer', () => {
    const myReducer = () => () => undefined;
    const def = createPlainReducerDef(myReducer);
    expect(def.defKind).toBe(DefKind.reducer);
    expect(def.defSubKind).toBe(ReducerDefSubKind.plain);
    expect(def[jSymbols.defPayload]).toBe(myReducer);
  });
});

describe('createMixRedicerDef', () => {
  test('should create a MixReducerDefby passing a selector', () => {
    const myReducer = () => () => [];
    const def = createMixReducerDef(myReducer);
    expect(def.defKind).toBe(DefKind.reducer);
    expect(def.defSubKind).toBe(ReducerDefSubKind.mix);   
    expect(def[jSymbols.defPayload]).toBe(myReducer);
  });
});

describe('isPlainReducerDef', () => {
  test('should return true if an object is a PlainReducerDef', () => {
    const myReducer = () => () => undefined;
    const def = createPlainReducerDef(myReducer);
    expect(isPlainReducerDef(def)).toBe(true);
  });

  test('should return false if an object is a MixReducerDef', () => {
    const myReducer = () => () => [];
    const def = createMixReducerDef(myReducer);
    expect(isPlainReducerDef(def)).toBe(false);
  });

  test('should return false if an object is not a PlainReducerDef', () => {
    expect(isPlainReducerDef(createDef(DefKind.selector, '', undefined))).toBe(false);
    expect(isPlainReducerDef(null)).toBe(false);
    expect(isPlainReducerDef(undefined)).toBe(false);
    expect(isPlainReducerDef('dummy')).toBe(false);
  });
});

describe('isMixReducerDef', () => {
  test('should return true if an object is a MixReducerDef', () => {
    const myReducer = () => () => [];
    const def = createMixReducerDef(myReducer);
    expect(isMixReducerDef(def)).toBe(true);
  });

  test('should return false if an object is a PlainReducerDef', () => {
    const myReducer = () => () => undefined;
    const def = createPlainReducerDef(myReducer);
    expect(isMixReducerDef(def)).toBe(false);
  });

  test('should return false if an object is not a MixReducerDef', () => {
    expect(isPlainReducerDef(createDef(DefKind.selector, '', undefined))).toBe(false);
    expect(isMixReducerDef(null)).toBe(false);
    expect(isMixReducerDef(undefined)).toBe(false);
    expect(isMixReducerDef('dummy')).toBe(false);
  });
});

describe('reducer composer', () => {
  test('should create a PlainReducerDef by passing a Juncture instance and a reducer', () => {
    class MySchema extends Schema<string> {
      constructor() {
        super('');
      }
    }
    class MyFrame<J extends MyJuncture> extends Frame<J> { }
    class MyJuncture extends Juncture {
      schema = createSchemaDef(() => new MySchema());

      [jSymbols.createFrame] = (config: FrameConfig) => new MyFrame(this, config);

      aValue = 21;

      myReducer = reducer(this, ({ value }) => () => value());
    }
    const myJuncture = new MyJuncture();
    expect(isPlainReducerDef(myJuncture.myReducer)).toBe(true);
  });
});

describe('mixReducer composer', () => {
  test('should create a MixReducerDef by passing a Juncture instance and a selector', () => {
    class MySchema extends Schema<string> {
      constructor() {
        super('');
      }
    }
    class MyFrame<J extends MyJuncture> extends Frame<J> { }
    class MyJuncture extends Juncture {
      schema = createSchemaDef(() => new MySchema());

      [jSymbols.createFrame] = (config: FrameConfig) => new MyFrame(this, config);

      myReducer = mixReducer(this, () => () => []);
    }
    const myJuncture = new MyJuncture();
    expect(isMixReducerDef(myJuncture.myReducer)).toBe(true);
  });
});
