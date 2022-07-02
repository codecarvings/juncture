/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Frame, FrameConfig } from '../../frame/frame';
import { Juncture } from '../../juncture';
import {
  createMixRedicerDefinition, createReducerDefinition, isMixReducerDefinition, isPlainReducerDefinition,
  isReducerDefinition, mixReducer, reducer, reducerDefinitionKind
} from '../../kernel/reducer';
import { createSchemaDefinition, Schema } from '../../kernel/schema';
import { jSymbols } from '../../symbols';

describe('reducerDefinitionKind', () => {
  test('should contain "reducer"', () => {
    expect(reducerDefinitionKind).toBe('reducer');
  });
});

describe('createReducerDefinition', () => {
  test('should create a plain ReducerDefinition by passing a reducer', () => {
    const myReducer = () => () => undefined;
    const definition = createReducerDefinition(myReducer);
    expect(definition[jSymbols.definitionKind]).toBe(reducerDefinitionKind);
    expect(definition[jSymbols.definitionPayload]).toBe(myReducer);
    expect((definition as any)[jSymbols.mixReducerTag]).toBeUndefined();
  });
});

describe('createMixRedicerDefinition', () => {
  test('should create a MixReducerDefinition by passing a selector', () => {
    const myReducer = () => () => [];
    const definition = createMixRedicerDefinition(myReducer);
    expect(definition[jSymbols.definitionKind]).toBe(reducerDefinitionKind);
    expect(definition[jSymbols.definitionPayload]).toBe(myReducer);
    expect(definition[jSymbols.mixReducerTag]).toBe(true);
  });
});

describe('isReducerDefinition', () => {
  test('should return true if an object is a plain ReducerDefinition', () => {
    const myReducer = () => () => undefined;
    const definition = createReducerDefinition(myReducer);
    expect(isReducerDefinition(definition)).toBe(true);
  });

  test('should return true if an object is a MixReducerDefinition', () => {
    const myReducer = () => () => [];
    const definition = createMixRedicerDefinition(myReducer);
    expect(isReducerDefinition(definition)).toBe(true);
  });

  test('should return false if an object is not a ReducerDefinition', () => {
    expect(isReducerDefinition(null)).toBe(false);
    expect(isReducerDefinition(undefined)).toBe(false);
    expect(isReducerDefinition('dummy')).toBe(false);
  });
});

describe('isPlainReducerDefinition', () => {
  test('should return true if an object is a plain ReducerDefinition', () => {
    const myReducer = () => () => undefined;
    const definition = createReducerDefinition(myReducer);
    expect(isPlainReducerDefinition(definition)).toBe(true);
  });

  test('should return false if an object is a MixReducerDefinition', () => {
    const myReducer = () => () => [];
    const definition = createMixRedicerDefinition(myReducer);
    expect(isPlainReducerDefinition(definition)).toBe(false);
  });

  test('should return false if an object is not a ReducerDefinition', () => {
    expect(isPlainReducerDefinition(null)).toBe(false);
    expect(isPlainReducerDefinition(undefined)).toBe(false);
    expect(isPlainReducerDefinition('dummy')).toBe(false);
  });
});

describe('isMixReducerDefinition', () => {
  test('should return true if an object is a MixReducerDefinition', () => {
    const myReducer = () => () => [];
    const definition = createMixRedicerDefinition(myReducer);
    expect(isMixReducerDefinition(definition)).toBe(true);
  });

  test('should return false if an object is a plain ReducerDefinition', () => {
    const myReducer = () => () => undefined;
    const definition = createReducerDefinition(myReducer);
    expect(isMixReducerDefinition(definition)).toBe(false);
  });

  test('should return false if an object is not a ReducerDefinition', () => {
    expect(isMixReducerDefinition(null)).toBe(false);
    expect(isMixReducerDefinition(undefined)).toBe(false);
    expect(isMixReducerDefinition('dummy')).toBe(false);
  });
});

describe('reducer composer', () => {
  test('should create a plain ReducerDefinition by passing a Juncture instance and a reducer', () => {
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

      myReducer = reducer(this, ({ value }) => () => value());
    }
    const myJuncture = new MyJuncture();
    expect(isPlainReducerDefinition(myJuncture.myReducer)).toBe(true);
  });
});

describe('mixReducer composer', () => {
  test('should create a MixReducerDefinition by passing a Juncture instance and a selector', () => {
    class MySchema extends Schema<string> {
      constructor() {
        super('');
      }
    }
    class MyFrame<J extends MyJuncture> extends Frame<J> { }
    class MyJuncture extends Juncture {
      schema = createSchemaDefinition(() => new MySchema());

      [jSymbols.createFrame] = (config: FrameConfig) => new MyFrame(this, config);

      myReducer = mixReducer(this, () => () => []);
    }
    const myJuncture = new MyJuncture();
    expect(isMixReducerDefinition(myJuncture.myReducer)).toBe(true);
  });
});
