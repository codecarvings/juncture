/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefComposer, PrivateDefComposer } from '../../definition/composer';
import { AssemblablePropertyCallback, PropertyAssembler } from '../../definition/property-assembler';
import { isMixReducerDef, isPlainReducerDef } from '../../definition/reducer';
import { createSchemaDef, Schema } from '../../definition/schema';
import { isDirectSelectorDef, isParamSelectorDef } from '../../definition/selector';
import { Juncture } from '../../juncture';

class MySchema extends Schema<string> {
  constructor() {
    super('');
  }
}
class MyJuncture extends Juncture {
  schema = createSchemaDef(() => new MySchema());
}

let juncture: MyJuncture;
beforeEach(() => {
  juncture = Juncture.getInstance(MyJuncture);
});

const dummyPropertyAssembler: PropertyAssembler = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registerProperty<V extends object>(value: V, callback?: AssemblablePropertyCallback): V {
    return value;
  },
  isClosed: false,
  close() {
    this.isClosed = true;
  }
};

describe('PrivateDefComposer', () => {
  test('should be a class instantiable by passing a Juncture instance and a property assembler', () => {
    const composer = new PrivateDefComposer(juncture, dummyPropertyAssembler);
    expect(composer).toBeInstanceOf(PrivateDefComposer);
  });

  describe('instance', () => {
    let composer: PrivateDefComposer<MyJuncture>;
    beforeEach(() => {
      composer = new PrivateDefComposer(juncture, dummyPropertyAssembler);
    });

    describe('"selector" property', () => {
      test('should be a function', () => {
        expect(typeof composer.selector).toBe('function');
      });

      test('should create a Private DirectSelectorDef by passing a selector', () => {
        const mySelector = composer.selector(({ value }) => value());
        (juncture as any).mySelector = mySelector;
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
        expect(isMixReducerDef(myReducer)).toBe(true);
        expect(myReducer.access).toBe('private');
      });
    });
  });
});

describe('DefComposer', () => {
  test('should accept a Juncture instance and a property assembler', () => {
    const composer = new DefComposer(juncture, dummyPropertyAssembler);
    expect(composer).toBeInstanceOf(DefComposer);
  });

  test('should accept a Juncture instance only without the need to provided an additional property assembler', () => {
    const composer = new DefComposer(juncture);
    expect(composer).toBeInstanceOf(DefComposer);
  });

  describe('instance', () => {
    let composer: DefComposer<MyJuncture>;
    beforeEach(() => {
      composer = new DefComposer(juncture, dummyPropertyAssembler);
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
        expect(isMixReducerDef(myReducer)).toBe(true);
      });
    });

    describe('"override" property', () => {
      test('should be a function', () => {
        expect(typeof composer.override).toBe('function');
      });

      // eslint-disable-next-line max-len
      test('should accept a dummy parameter (for typing), but should ignore it and return always the same "OverrideMannequin" object', () => {
        const mySelector = composer.paramSelector(() => (val: string) => val.length);
        const myReducer = composer.reducer(() => () => undefined!);

        const OverrideMannequin1 = composer.override(mySelector);
        expect(typeof OverrideMannequin1).toBe('object');
        const OverrideMannequin2 = composer.override(myReducer);
        expect(OverrideMannequin2).toBe(OverrideMannequin1);
        const OverrideMannequin3 = composer.override<typeof mySelector>(undefined!);
        expect(OverrideMannequin3).toBe(OverrideMannequin1);
      });
    });
  });
});
