/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefComposer, PrivateDefComposer } from '../../definition/composer';
import { isMixReducerDef, isPlainReducerDef } from '../../definition/reducer';
import { createSchemaDef, Schema } from '../../definition/schema';
import { isDirectSelectorDef, isParamSelectorDef } from '../../definition/selector';
import { Frame, FrameConfig } from '../../frame/frame';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';
import { finalizeAssembling } from '../../util/assembler';

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

let juncture: MyJuncture;
beforeEach(() => {
  juncture = Juncture.getInstance(MyJuncture);
});

describe('PrivateDefComposer', () => {
  test('should be a class instantiable by passing a Juncture instance', () => {
    const composer = new PrivateDefComposer(juncture);
    expect(composer).toBeInstanceOf(PrivateDefComposer);
  });

  describe('instance', () => {
    let composer: PrivateDefComposer<MyJuncture>;
    beforeEach(() => {
      composer = new PrivateDefComposer(juncture);
    });

    describe('"selector" property', () => {
      test('should be a function', () => {
        expect(typeof composer.selector).toBe('function');
      });

      test('should create a Private DirectSelectorDef by passing a selector', () => {
        const mySelector = composer.selector(({ value }) => value());
        (juncture as any).mySelector = mySelector;
        finalizeAssembling(juncture);
        expect(isDirectSelectorDef(mySelector)).toBe(true);
        expect(mySelector.access).toBe('private');
      });
    });

    describe('"paramSelector" property', () => {
      test('should be a function', () => {
        expect(typeof composer.paramSelector).toBe('function');
      });

      test('should create a Private ParamSelectorDef by passing a selector', () => {
        const mySelector = composer.paramSelector(() => (val: string) => val.length);
        (juncture as any).mySelector = mySelector;
        finalizeAssembling(juncture);
        expect(isParamSelectorDef(mySelector)).toBe(true);
        expect(mySelector.access).toBe('private');
      });
    });

    describe('"reducer" property', () => {
      test('should be a function', () => {
        expect(typeof composer.reducer).toBe('function');
      });

      test('should create a Private PlainReducerDef by passing a reducer', () => {
        const myReducer = composer.reducer(({ value }) => () => value());
        (juncture as any).myReducer = myReducer;
        finalizeAssembling(juncture);
        expect(isPlainReducerDef(myReducer)).toBe(true);
        expect(myReducer.access).toBe('private');
      });
    });

    describe('"mixReducer" property', () => {
      test('should be a function', () => {
        expect(typeof composer.mixReducer).toBe('function');
      });

      test('should create a Private MixReducerDef by passing a reducer', () => {
        const myReducer = composer.mixReducer(() => () => []);
        (juncture as any).myReducer = myReducer;
        finalizeAssembling(juncture);
        expect(isMixReducerDef(myReducer)).toBe(true);
        expect(myReducer.access).toBe('private');
      });
    });
  });
});

describe('DefComposer', () => {
  test('should be a class instantiable by passing a Juncture instance', () => {
    const composer = new DefComposer(juncture);
    expect(composer).toBeInstanceOf(DefComposer);
  });

  describe('instance', () => {
    let composer: DefComposer<MyJuncture>;
    beforeEach(() => {
      composer = new DefComposer(juncture);
    });

    test('"private" property should return a PrivateDefComposer instance', () => {
      expect(composer.private).toBeInstanceOf(PrivateDefComposer);
    });

    describe('"selector" property', () => {
      test('should be a function', () => {
        expect(typeof composer.selector).toBe('function');
      });

      test('should create a DirectSelectorDef by passing a selector', () => {
        const mySelector = composer.selector(({ value }) => value());
        (juncture as any).mySelector = mySelector;
        finalizeAssembling(juncture);
        expect(isDirectSelectorDef(mySelector)).toBe(true);
      });
    });

    describe('"paramSelector" property', () => {
      test('should be a function', () => {
        expect(typeof composer.paramSelector).toBe('function');
      });

      test('should create a ParamSelectorDef by passing a selector', () => {
        const mySelector = composer.paramSelector(() => (val: string) => val.length);
        (juncture as any).mySelector = mySelector;
        finalizeAssembling(juncture);
        expect(isParamSelectorDef(mySelector)).toBe(true);
      });
    });

    describe('"reducer" property', () => {
      test('should be a function', () => {
        expect(typeof composer.reducer).toBe('function');
      });

      test('should create a PlainReducerDef by passing a reducer', () => {
        const myReducer = composer.reducer(({ value }) => () => value());
        (juncture as any).myReducer = myReducer;
        finalizeAssembling(juncture);
        expect(isPlainReducerDef(myReducer)).toBe(true);
      });
    });

    describe('"mixReducer" property', () => {
      test('should be a function', () => {
        expect(typeof composer.mixReducer).toBe('function');
      });

      test('should create a MixReducerDef by passing a reducer', () => {
        const myReducer = composer.mixReducer(() => () => []);
        (juncture as any).myReducer = myReducer;
        finalizeAssembling(juncture);
        expect(isMixReducerDef(myReducer)).toBe(true);
      });
    });

    describe('"override" property', () => {
      test('should be a function', () => {
        expect(typeof composer.override).toBe('function');
      });

      xtest('should accept a dummy parameter (for typing), but should ignore it', () => {
        const mySelector = composer.paramSelector(() => (val: string) => val.length);
        const overrideComposer1 = composer.override(mySelector);
        expect(typeof overrideComposer1).toBe('object');
        const overrideComposer2 = composer.override<typeof mySelector>(undefined!);
        expect(typeof overrideComposer2).toBe('object');
      });
    });
  });
});
