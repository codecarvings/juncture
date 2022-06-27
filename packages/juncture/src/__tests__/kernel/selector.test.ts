/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Frame, FrameConfig } from '../../frame/frame';
import { Juncture } from '../../juncture';
import { createSchemaDefinition, Schema } from '../../kernel/schema';
import {
  createParamSelectorDefinition,
  createSelectorDefinition,
  isDirectSelectorDefinition,
  isParamSelectorDefinition,
  isSelectorDefinition, paramSelector, selector, selectorDefinitionKind
} from '../../kernel/selector';
import { jSymbols } from '../../symbols';

describe('selectorDefinitionKind', () => {
  test('should contain "selector"', () => {
    expect(selectorDefinitionKind).toBe('selector');
  });
});

describe('createSelectorDefinition', () => {
  test('should create a direct SelectorDefinition by passing a selector', () => {
    const mySelector = () => () => undefined;
    const definition = createSelectorDefinition(mySelector);
    expect(definition[jSymbols.definitionKind]).toBe(selectorDefinitionKind);
    expect(definition[jSymbols.definitionPayload]).toBe(mySelector);
    expect((definition as any)[jSymbols.paramSelectorTag]).toBeUndefined();
  });
});

describe('createParamSelectorDefinition', () => {
  test('should create a ParamSelectorDefinition by passing a selector', () => {
    const mySelector = () => () => undefined;
    const definition = createParamSelectorDefinition(mySelector);
    expect(definition[jSymbols.definitionKind]).toBe(selectorDefinitionKind);
    expect(definition[jSymbols.definitionPayload]).toBe(mySelector);
    expect(definition[jSymbols.paramSelectorTag]).toBe(true);
  });
});

describe('isSelectorDefinition', () => {
  test('should return true if an object is a direct SelectorDefinition', () => {
    const mySelector = () => undefined;
    const definition = createSelectorDefinition(mySelector);
    expect(isSelectorDefinition(definition)).toBe(true);
  });

  test('should return true if an object is a param SelectorDefinition', () => {
    const mySelector = () => () => undefined;
    const definition = createParamSelectorDefinition(mySelector);
    expect(isSelectorDefinition(definition)).toBe(true);
  });

  test('should return false if an object is not a SelectorDefinition', () => {
    expect(isSelectorDefinition(null)).toBe(false);
    expect(isSelectorDefinition(undefined)).toBe(false);
    expect(isSelectorDefinition('dummy')).toBe(false);
  });
});

describe('isDirectSelectorDefinition', () => {
  test('should return true if an object is a direct SelectorDefinition', () => {
    const mySelector = () => undefined;
    const definition = createSelectorDefinition(mySelector);
    expect(isDirectSelectorDefinition(definition)).toBe(true);
  });

  test('should return false if an object is a param SelectorDefinition', () => {
    const mySelector = () => () => undefined;
    const definition = createParamSelectorDefinition(mySelector);
    expect(isDirectSelectorDefinition(definition)).toBe(false);
  });

  test('should return false if an object is not a SelectorDefinition', () => {
    expect(isSelectorDefinition(null)).toBe(false);
    expect(isSelectorDefinition(undefined)).toBe(false);
    expect(isSelectorDefinition('dummy')).toBe(false);
  });
});

describe('isParamSelectorDefinition', () => {
  test('should return true if an object is a param SelectorDefinition', () => {
    const mySelector = () => () => undefined;
    const definition = createParamSelectorDefinition(mySelector);
    expect(isParamSelectorDefinition(definition)).toBe(true);
  });

  test('should return false if an object is a direct SelectorDefinition', () => {
    const mySelector = () => undefined;
    const definition = createSelectorDefinition(mySelector);
    expect(isParamSelectorDefinition(definition)).toBe(false);
  });

  test('should return false if an object is not a SelectorDefinition', () => {
    expect(isParamSelectorDefinition(null)).toBe(false);
    expect(isParamSelectorDefinition(undefined)).toBe(false);
    expect(isParamSelectorDefinition('dummy')).toBe(false);
  });
});

describe('selector composer', () => {
  test('should create a direct SelectorDefinition by passing a Juncture instance and a selector', () => {
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

      mySelector = selector(this, ({ value }) => value());
    }
    const myJuncture = new MyJuncture();
    expect(isDirectSelectorDefinition(myJuncture.mySelector)).toBe(true);
  });
});

describe('paramSelector composer', () => {
  test('should create a param SelectorDefinition by passing a Juncture instance and a selector', () => {
    class MySchema extends Schema<string> {
      constructor() {
        super('');
      }
    }
    class MyFrame<J extends MyJuncture> extends Frame<J> { }
    class MyJuncture extends Juncture {
      schema = createSchemaDefinition(() => new MySchema());

      [jSymbols.createFrame] = (config: FrameConfig) => new MyFrame(this, config);

      mySelector = paramSelector(this, () => (val: string) => val.length);
    }
    const myJuncture = new MyJuncture();
    expect(isParamSelectorDefinition(myJuncture.mySelector)).toBe(true);
  });
});
