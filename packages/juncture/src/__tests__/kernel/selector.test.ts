/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../../juncture';
import {
  createDirectSelectorDefinition, createParamSelectorDefinition,
  isDirectSelectorDefinition,
  isParamSelectorDefinition,
  paramSelector,
  selector, selectorDefinitionKind, SelectorDefinitionSubkind
} from '../../kernel/selector';
import { jSymbols } from '../../symbols';

describe('createDirectSelectorDefinition', () => {
  test('should create a DirectSelectorDefinition by passing a selector', () => {
    const mySelector = () => () => undefined;
    const definition = createDirectSelectorDefinition(mySelector);
    expect(definition[jSymbols.definitionKind]).toBe(selectorDefinitionKind);
    expect(definition[jSymbols.definitionFn]).toBe(mySelector);
    expect(definition[jSymbols.selectorDefinitionSubkind]).toBe(SelectorDefinitionSubkind.direct);
  });
});

describe('createParamSelectorDefinition', () => {
  test('should create a ParamSelectorDefinition by passing a selector', () => {
    const mySelector = () => () => undefined;
    const definition = createParamSelectorDefinition(mySelector);
    expect(definition[jSymbols.definitionKind]).toBe(selectorDefinitionKind);
    expect(definition[jSymbols.definitionFn]).toBe(mySelector);
    expect(definition[jSymbols.selectorDefinitionSubkind]).toBe(SelectorDefinitionSubkind.param);
  });
});

describe('isDirectSelectorDefinition', () => {
  test('should check if an object is a DirectSelectorDefinition', () => {
    const mySelector = () => () => undefined;
    const definition = createDirectSelectorDefinition(mySelector);
    expect(isDirectSelectorDefinition(definition)).toBe(true);
  });
});

describe('isParamSelectorDefinition', () => {
  test('should check if an object is a ParamSelectorDefinition', () => {
    const mySelector = () => () => undefined;
    const definition = createParamSelectorDefinition(mySelector);
    expect(isParamSelectorDefinition(definition)).toBe(true);
  });
});

describe('selector composer', () => {
  test('should create a DirectSelectorDefinition by passing a Juncture instance and a selector', () => {
    class MyJuncture extends Juncture {
      mySelector = selector(this, () => () => 'test');
    }
    const myJuncture = new MyJuncture();
    expect(isDirectSelectorDefinition(myJuncture.mySelector)).toBe(true);
  });
});

describe('paramSelector composer', () => {
  test('should create a ParamSelectorDefinition by passing a Juncture instance and a selector', () => {
    class MyJuncture extends Juncture {
      mySelector = paramSelector(this, () => (val: string) => val.length);
    }
    const myJuncture = new MyJuncture();
    expect(isParamSelectorDefinition(myJuncture.mySelector)).toBe(true);
  });
});
