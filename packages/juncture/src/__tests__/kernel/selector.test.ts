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
import { createSchemaDef, Schema } from '../../kernel/schema';
import {
  createDirectSelectorDef,
  createParamSelectorDef,
  isDirectSelectorDef,
  isParamSelectorDef,
  paramSelector, selector, SelectorDefSubKind
} from '../../kernel/selector';
import { jSymbols } from '../../symbols';

describe('createDirectSelectorDef', () => {
  test('should create a DiretSelectorDef by passing a selector', () => {
    const mySelector = () => undefined;
    const de = createDirectSelectorDef(mySelector);
    expect(de.defKind).toBe(DefKind.selector);
    expect(de.defSubKind).toBe(SelectorDefSubKind.direct);
    expect(de[jSymbols.defPayload]).toBe(mySelector);
  });
});

describe('createParamSelectorDef', () => {
  test('should create a ParamSelectorDef by passing a selector', () => {
    const mySelector = () => () => undefined;
    const def = createParamSelectorDef(mySelector);
    expect(def.defKind).toBe(DefKind.selector);
    expect(def.defSubKind).toBe(SelectorDefSubKind.param);
    expect(def[jSymbols.defPayload]).toBe(mySelector);
  });
});

describe('isDirectSelectorDef', () => {
  test('should return true if an object is a DirectSelectorDef', () => {
    const mySelector = () => undefined;
    const def = createDirectSelectorDef(mySelector);
    expect(isDirectSelectorDef(def)).toBe(true);
  });

  test('should return false if an object is a ParamSelectorDef', () => {
    const mySelector = () => () => undefined;
    const def = createParamSelectorDef(mySelector);
    expect(isDirectSelectorDef(def)).toBe(false);
  });

  test('should return false if an object is not a DirectSelectorDef', () => {
    expect(isDirectSelectorDef(createDef(DefKind.schema, '', undefined))).toBe(false);
    expect(isDirectSelectorDef(null)).toBe(false);
    expect(isDirectSelectorDef(undefined)).toBe(false);
    expect(isDirectSelectorDef('dummy')).toBe(false);
  });
});

describe('isParamSelectorDef', () => {
  test('should return true if an object is a ParamSelectorDef', () => {
    const mySelector = () => () => undefined;
    const def = createParamSelectorDef(mySelector);
    expect(isParamSelectorDef(def)).toBe(true);
  });

  test('should return false if an object is a DirectSelectorDef', () => {
    const mySelector = () => undefined;
    const def = createDirectSelectorDef(mySelector);
    expect(isParamSelectorDef(def)).toBe(false);
  });

  test('should return false if an object is not a ParamSelectorDef', () => {
    expect(isParamSelectorDef(createDef(DefKind.schema, '', undefined))).toBe(false);
    expect(isParamSelectorDef(null)).toBe(false);
    expect(isParamSelectorDef(undefined)).toBe(false);
    expect(isParamSelectorDef('dummy')).toBe(false);
  });
});

describe('selector composer', () => {
  test('should create a DirectSelectorDef by passing a Juncture instance and a selector', () => {
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

      mySelector = selector(this, ({ value }) => value());
    }
    const myJuncture = new MyJuncture();
    expect(isDirectSelectorDef(myJuncture.mySelector)).toBe(true);
  });
});

describe('paramSelector composer', () => {
  test('should create a ParamSelectorDef by passing a Juncture instance and a selector', () => {
    class MySchema extends Schema<string> {
      constructor() {
        super('');
      }
    }
    class MyFrame<J extends MyJuncture> extends Frame<J> { }
    class MyJuncture extends Juncture {
      schema = createSchemaDef(() => new MySchema());

      [jSymbols.createFrame] = (config: FrameConfig) => new MyFrame(this, config);

      mySelector = paramSelector(this, () => (val: string) => val.length);
    }
    const myJuncture = new MyJuncture();
    expect(isParamSelectorDef(myJuncture.mySelector)).toBe(true);
  });
});
