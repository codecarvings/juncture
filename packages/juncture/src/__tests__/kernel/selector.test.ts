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
  paramSelector,
  selector, selectorDefinitionKind, SelectorDefinitionSubkind
} from '../../kernel/selector';
import { jSymbols } from '../../symbols';

describe('definition builder functions', () => {
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
});

describe('composer functions', () => {
  describe('selector composer', () => {
    test('should create a DirectSelectorDefinition by passing a Juncture instance and a selector', () => {
      class MyJuncture extends Juncture {
        mySelector = selector(this, () => () => 'test');
      }
      const myJuncture = new MyJuncture();
      const definition = myJuncture.mySelector;
      expect(definition[jSymbols.definitionKind]).toBe(selectorDefinitionKind);
      expect(definition[jSymbols.selectorDefinitionSubkind]).toBe(SelectorDefinitionSubkind.direct);
    });
  });

  describe('paramSelector composer', () => {
    test('should create a ParamSelectorDefinition by passing a Juncture instance and a selector', () => {
      class MyJuncture extends Juncture {
        mySelector = paramSelector(this, () => (val: string) => val.length);
      }
      const myJuncture = new MyJuncture();
      const definition = myJuncture.mySelector;
      expect(definition[jSymbols.definitionKind]).toBe(selectorDefinitionKind);
      expect(definition[jSymbols.selectorDefinitionSubkind]).toBe(SelectorDefinitionSubkind.param);
    });
  });
});
