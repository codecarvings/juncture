/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */
/* eslint-disable no-multi-assign */

import { Composer, PrivateComposer } from '../composer';
import { Action } from '../context/action';
import { DefAccess } from '../definition/def';
import {
  isMixReducerDef, isReducerDef, MixReducerDef, PrivateMixReducerDef, PrivateReducerDef, ProtectedMixReducerDef, ProtectedReducerDef, ReducerDef
} from '../definition/reducer';
import { createSchemaDef, Schema, SchemaDef } from '../definition/schema';
import {
  isParamSelectorDef, isSelectorDef, ParamSelectorDef, PrivateParamSelectorDef, PrivateSelectorDef, SelectorDef
} from '../definition/selector';
import { PropertyAssembler } from '../fabric/property-assembler';
import { Juncture } from '../juncture';
import { jSymbols } from '../symbols';

interface MyJuncture extends Juncture {
  schema: SchemaDef<Schema<string>>;
}

let container: any;
let assembler: PropertyAssembler;
beforeEach(() => {
  container = { };
  assembler = new PropertyAssembler(container);
});

describe('PrivateComposer', () => {
  test('should be a class instantiable by passing a property assembler', () => {
    const composer = new PrivateComposer(assembler);
    expect(composer).toBeInstanceOf(PrivateComposer);
  });

  describe('instance', () => {
    let composer: PrivateComposer<MyJuncture>;
    beforeEach(() => {
      composer = new PrivateComposer<MyJuncture>(assembler);
    });

    describe('selector', () => {
      test('should be a method', () => {
        expect(typeof composer.selector).toBe('function');
      });

      test('should create, after property wiring, a Private SelectorDef, by passing a selector function', () => {
        container.mySelector = composer.selector(({ value }) => value());
        assembler.wire();
        expect(isSelectorDef(container.mySelector)).toBe(true);
        expect(container.mySelector.access).toBe('private');
      });
    });

    describe('paramSelector', () => {
      test('should be a method', () => {
        expect(typeof composer.paramSelector).toBe('function');
      });

      test('should create, after property wiring, a Private ParamSelectorDef, by passing a selector function', () => {
        container.mySelector = composer.paramSelector(() => (val: string) => val.length);
        assembler.wire();
        expect(isParamSelectorDef(container.mySelector)).toBe(true);
        expect(container.mySelector.access).toBe('private');
      });
    });

    describe('reducer', () => {
      test('should be a method', () => {
        expect(typeof composer.reducer).toBe('function');
      });

      test('should create, after property wiring, a Private ReducerDef, by passing a reducer function', () => {
        container.myReducer = composer.reducer(({ value }) => () => value());
        assembler.wire();
        expect(isReducerDef(container.myReducer)).toBe(true);
        expect(container.myReducer.access).toBe('private');
      });
    });

    describe('mixReducer', () => {
      test('should be a method', () => {
        expect(typeof composer.mixReducer).toBe('function');
      });

      test('should create, after property wiring, a Private MixReducerDef, by passing a reducer function', () => {
        container.myReducer = composer.mixReducer(() => () => []);
        assembler.wire();
        expect(isMixReducerDef(container.myReducer)).toBe(true);
        expect(container.myReducer.access).toBe('private');
      });
    });
  });
});

describe('Composer', () => {
  describe('constructor', () => {
    test('should accept a property assembler', () => {
      const composer = new Composer(assembler);
      expect(composer).toBeInstanceOf(Composer);
    });
  });

  describe('instance', () => {
    let composer: Composer<MyJuncture>;
    beforeEach(() => {
      composer = new Composer<MyJuncture>(assembler);
    });

    test('"private" property should return a PrivateComposer instance', () => {
      expect(composer.private).toBeInstanceOf(PrivateComposer);
    });

    describe('selector', () => {
      test('should be a method', () => {
        expect(typeof composer.selector).toBe('function');
      });

      test('should create, after property wiring, a SelectorDef, by passing a selector function', () => {
        container.mySelector = composer.selector(({ value }) => value());
        assembler.wire();
        expect(isSelectorDef(container.mySelector)).toBe(true);
      });
    });

    describe('paramSelector', () => {
      test('should be a method', () => {
        expect(typeof composer.paramSelector).toBe('function');
      });

      test('should create, after property wiring, a ParamSelectorDef, by passing a selector function', () => {
        container.mySelector = composer.paramSelector(() => (val: string) => val.length);
        assembler.wire();
        expect(isParamSelectorDef(container.mySelector)).toBe(true);
      });
    });

    describe('reducer', () => {
      test('should be a method', () => {
        expect(typeof composer.reducer).toBe('function');
      });

      test('should create, after property wiring, a ReducerDef, by passing a reducer function', () => {
        container.myReducer = composer.reducer(({ value }) => () => value());
        assembler.wire();
        expect(isReducerDef(container.myReducer)).toBe(true);
      });
    });

    describe('mixReducer', () => {
      test('should be a method', () => {
        expect(typeof composer.mixReducer).toBe('function');
      });

      test('should create, after property wiring, a MixReducerDef, by passing a reducer function', () => {
        container.myReducer = composer.mixReducer(() => () => []);
        assembler.wire();
        expect(isMixReducerDef(container.myReducer)).toBe(true);
      });
    });

    describe('override', () => {
      test('should be a method', () => {
        expect(typeof composer.override).toBe('function');
      });

      describe('when incorrectly used', () => {
        test('should throw error during wire if the parent does not exists', () => {
          const myOriginalSelector = composer.selector(() => 'original with different key');
          container.myOriginalSelector = myOriginalSelector;
          const proxy = composer.override(myOriginalSelector);
          container.myNewSelector = proxy.selector(({ value }) => value());
          expect(() => {
            assembler.wire();
          }).toThrow();
        });

        test('should throw error during wire if the parent is not a Def', () => {
          const myOriginalSelector = composer.selector(() => 'original with different key');
          container.myOriginalSelector = myOriginalSelector;
          container.myNewSelector = assembler.registerStaticProperty('This is not a Def');
          const proxy = composer.override(myOriginalSelector);
          container.myNewSelector = proxy.selector(({ value }) => value());
          expect(() => {
            assembler.wire();
          }).toThrow();
        });
      });

      describe('when passing a SelectorDef as type argument, proxy should provide access to', () => {
        let myOriginalSelector: SelectorDef<string>;
        beforeEach(() => {
          myOriginalSelector = container.mySelector = composer.selector(() => 'original');
          assembler.wire();
          myOriginalSelector = container.mySelector;
        });

        describe('a "selector" property that', () => {
          test('should be a method', () => {
            const proxy = composer.override(myOriginalSelector);
            expect(typeof proxy.selector).toBe('function');
          });

          test('should create, after property wiring, a new SelectorDef assignable to the parent, by passing a selector function', () => {
            const proxy = composer.override(myOriginalSelector);
            let myNewSelector: SelectorDef<string> = container.mySelector = proxy.selector(({ value }) => value());
            assembler.wire();
            myNewSelector = container.mySelector;
            expect(isSelectorDef(myNewSelector)).toBe(true);
            expect(myNewSelector).not.toBe(myOriginalSelector);
          });

          test('should provide access to the parent selector', () => {
            const proxy = composer.override(myOriginalSelector);
            container.mySelector = proxy.selector(({ parent }) => `${parent}2`);
            assembler.wire();
            const result = container.mySelector[jSymbols.defPayload]();
            expect(result).toBe('original2');
          });

          test('should return a public SelectorDef if the parent is public', () => {
            const proxy = composer.override(myOriginalSelector);
            let myNewSelector = container.mySelector = proxy.selector(({ value }) => value());
            assembler.wire();
            myNewSelector = container.mySelector;
            expect(myOriginalSelector.access).toBe(DefAccess.public);
            expect(isSelectorDef(myNewSelector, DefAccess.public)).toBe(true);
          });

          test('should return a private SelectorDef if the parent is private', () => {
            let myOriginalPrivateSelector: PrivateSelectorDef<string> = container.myPrivateSelector = composer.private.selector(() => 'original');
            assembler.wire();
            myOriginalPrivateSelector = container.myPrivateSelector;

            const proxy = composer.override(myOriginalPrivateSelector);
            let myNewPrivateSelector: PrivateSelectorDef<string> = container.myPrivateSelector = proxy.selector(({ value }) => value());
            assembler.wire();
            myNewPrivateSelector = container.myPrivateSelector;
            expect(myOriginalPrivateSelector.access).toBe(DefAccess.private);
            expect(isSelectorDef(myNewPrivateSelector, DefAccess.private)).toBe(true);
          });

          test('should throw error during wire if the parent is not a SelectorDef', () => {
            container.mySelector = assembler.registerStaticProperty(createSchemaDef(() => new Schema('')));
            const proxy = composer.override(myOriginalSelector);
            container.mySelector = proxy.selector(() => '');
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });

      describe('when passing a ParamSelectorDef as type argument, proxy should provide access to', () => {
        let myOriginalSelector: ParamSelectorDef<(value: string) => number>;
        beforeEach(() => {
          myOriginalSelector = container.mySelector = composer.paramSelector(() => (value: string) => value.length);
          assembler.wire();
          myOriginalSelector = container.mySelector;
        });

        describe('a "paramSelector" property that', () => {
          test('should be a method', () => {
            const proxy = composer.override(myOriginalSelector);
            expect(typeof proxy.paramSelector).toBe('function');
          });

          test('should create, after property wiring, a new ParamSelectorDef assignable to the parent, by passing a selector function', () => {
            const proxy = composer.override(myOriginalSelector);
            let myNewSelector: ParamSelectorDef<(value: string) => number> = container.mySelector = proxy.paramSelector(() => () => 0);
            assembler.wire();
            myNewSelector = container.mySelector;
            expect(isParamSelectorDef(myNewSelector)).toBe(true);
            expect(myNewSelector).not.toBe(myOriginalSelector);
          });

          test('should provide access to the parent selector', () => {
            const proxy = composer.override(myOriginalSelector);
            container.mySelector = proxy.paramSelector(({ parent }) => () => parent('abc'));
            assembler.wire();
            const result = container.mySelector[jSymbols.defPayload]()();
            expect(result).toBe(3);
          });

          test('should return a public ParamSelectorDef if the parent is public', () => {
            const proxy = composer.override(myOriginalSelector);
            let myNewSelector: ParamSelectorDef<(value: string) => number> = container.mySelector = proxy.paramSelector(() => () => 0);
            assembler.wire();
            myNewSelector = container.mySelector;
            expect(myOriginalSelector.access).toBe(DefAccess.public);
            expect(isParamSelectorDef(myNewSelector, DefAccess.public)).toBe(true);
          });

          test('should return a private ParamSelectorDef if the parent is private', () => {
            let myOriginalPrivateSelector: PrivateParamSelectorDef<(value: string) => number> = container
              .myPrivateSelector = composer.private.paramSelector(() => (value: string) => value.length);
            assembler.wire();
            myOriginalPrivateSelector = container.myPrivateSelector;

            const proxy = composer.override(myOriginalPrivateSelector);
            let myNewPrivateSelector: PrivateParamSelectorDef<(value: string) => number> = container.myPrivateSelector = proxy.paramSelector(() => () => 0);
            assembler.wire();
            myNewPrivateSelector = container.myPrivateSelector;
            expect(myOriginalPrivateSelector.access).toBe(DefAccess.private);
            expect(isParamSelectorDef(myNewPrivateSelector, DefAccess.private)).toBe(true);
          });

          test('should throw error during wire if the parent is not a ParamSelectorDef', () => {
            container.mySelector = assembler.registerStaticProperty(createSchemaDef(() => new Schema('')));
            const proxy = composer.override(myOriginalSelector);
            container.mySelector = proxy.paramSelector(() => () => '');
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });

      describe('when passing a ReducerDef as type argument, proxy should provide access to', () => {
        let myOriginalReducer: ReducerDef<(value: string) => string>;
        beforeEach(() => {
          myOriginalReducer = container.myReducer = composer.reducer(() => (value: string) => value.toUpperCase());
          assembler.wire();
          myOriginalReducer = container.myReducer;
        });

        describe('a "reducer" property that', () => {
          test('should be a method', () => {
            const proxy = composer.override(myOriginalReducer);
            expect(typeof proxy.reducer).toBe('function');
          });

          test('should create, after property wiring, a new ReducerDef assignable to the parent, by passing a reducer function', () => {
            const proxy = composer.override(myOriginalReducer);
            let myNewReducer: ReducerDef<(value: string) => string> = container.myReducer = proxy
              .reducer(() => (value: string) => value);
            assembler.wire();
            myNewReducer = container.myReducer;
            expect(isReducerDef(myNewReducer)).toBe(true);
            expect(myNewReducer).not.toBe(myOriginalReducer);
          });

          test('should provide access to the parent reducer', () => {
            const proxy = composer.override(myOriginalReducer);
            container.myReducer = proxy.reducer(({ parent }) => (value: string) => parent(`${value}2`));
            assembler.wire();
            const result = container.myReducer[jSymbols.defPayload]()('abc');
            expect(result).toBe('ABC2');
          });

          test('should return a public ReducerDef if the parent is public', () => {
            const proxy = composer.override(myOriginalReducer);
            let myNewReducer = container.myReducer = proxy.reducer(() => (value: string) => value);
            assembler.wire();
            myNewReducer = container.myReducer;
            expect(myOriginalReducer.access).toBe(DefAccess.public);
            expect(isReducerDef(myNewReducer, DefAccess.public)).toBe(true);
          });

          test('should return a protected ReducerDef if the parent is protected', () => {
            let myOriginalProtectedReducer: ProtectedReducerDef<(value: string) => string> = container.myProtectedReducer = composer
              .protected.reducer(() => (value: string) => value.toUpperCase());
            assembler.wire();
            myOriginalProtectedReducer = container.myProtectedReducer;

            const proxy = composer.override(myOriginalProtectedReducer);
            let myNewProtectedReducer: ProtectedReducerDef<(value: string) => string> = container.myProtectedReducer = proxy
              .reducer(() => (value: string) => value);
            assembler.wire();
            myNewProtectedReducer = container.myProtectedReducer;
            expect(myOriginalProtectedReducer.access).toBe(DefAccess.protected);
            expect(isReducerDef(myNewProtectedReducer, DefAccess.protected)).toBe(true);
          });

          test('should return a private ReducerDef if the parent is private', () => {
            let myOriginalPrivateReducer: PrivateReducerDef<(value: string) => string> = container.myPrivateReducer = composer
              .private.reducer(() => (value: string) => value.toUpperCase());
            assembler.wire();
            myOriginalPrivateReducer = container.myPrivateReducer;

            const proxy = composer.override(myOriginalPrivateReducer);
            let myNewPrivateReducer: PrivateReducerDef<(value: string) => string> = container.myPrivateReducer = proxy
              .reducer(() => (value: string) => value);
            assembler.wire();
            myNewPrivateReducer = container.myPrivateReducer;
            expect(myOriginalPrivateReducer.access).toBe(DefAccess.private);
            expect(isReducerDef(myNewPrivateReducer, DefAccess.private)).toBe(true);
          });

          test('should throw error during wire if the parent is not a ReducerDef', () => {
            container.myReducer = assembler.registerStaticProperty(createSchemaDef(() => new Schema('')));
            const proxy = composer.override(myOriginalReducer);
            container.myReducer = proxy.reducer(() => () => '');
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });

      describe('when passing a MixReducerDef as type argument, proxy should provide access to', () => {
        let myOriginalReducer: MixReducerDef<(value: string) => Action[]>;
        beforeEach(() => {
          myOriginalReducer = container.myReducer = composer.mixReducer(() => (value: string) => [{
            target: [],
            key: 'dummy',
            args: [value]
          }]);
          assembler.wire();
          myOriginalReducer = container.myReducer;
        });

        describe('a "mixReducer" property that', () => {
          test('should be a method', () => {
            const proxy = composer.override(myOriginalReducer);
            expect(typeof proxy.mixReducer).toBe('function');
          });

          test('should create, after property wiring, a new MixReducerDef assignable to the parent, by passing a reducer function', () => {
            const proxy = composer.override(myOriginalReducer);
            let myNewReducer: MixReducerDef<(value: string) => Action[]> = container.myReducer = proxy
              .mixReducer(() => () => []);
            assembler.wire();
            myNewReducer = container.myReducer;
            expect(isMixReducerDef(myNewReducer)).toBe(true);
            expect(myNewReducer).not.toBe(myOriginalReducer);
          });

          test('should provide access to the parent reducer', () => {
            const proxy = composer.override(myOriginalReducer);
            container.myReducer = proxy.mixReducer(({ parent }) => (value: string) => parent(`${value}2`));
            assembler.wire();
            const result = container.myReducer[jSymbols.defPayload]()('abc');
            expect(result).toEqual([{
              target: [],
              key: 'dummy',
              args: ['abc2']
            }]);
          });

          test('should return a public MixReducerDef if the parent is public', () => {
            const proxy = composer.override(myOriginalReducer);
            let myNewReducer = container.myReducer = proxy.mixReducer(() => () => []);
            assembler.wire();
            myNewReducer = container.myReducer;
            expect(myOriginalReducer.access).toBe(DefAccess.public);
            expect(isMixReducerDef(myNewReducer, DefAccess.public)).toBe(true);
          });

          test('should return a protected MixReducerDef if the parent is protected', () => {
            let myOriginalProtectedReducer: ProtectedMixReducerDef<(value: string) => Action[]> = container.myProtectedReducer = composer
              .protected.mixReducer(() => (value: string) => [{
                target: [],
                key: 'dummy',
                args: [value]
              }]);
            assembler.wire();
            myOriginalProtectedReducer = container.myProtectedReducer;

            const proxy = composer.override(myOriginalProtectedReducer);
            let myNewProtectedReducer: ProtectedMixReducerDef<(value: string) => Action[]> = container.myProtectedReducer = proxy
              .mixReducer(() => () => []);
            assembler.wire();
            myNewProtectedReducer = container.myProtectedReducer;
            expect(myOriginalProtectedReducer.access).toBe(DefAccess.protected);
            expect(isMixReducerDef(myNewProtectedReducer, DefAccess.protected)).toBe(true);
          });

          test('should return a private MixReducerDef if the parent is private', () => {
            let myOriginalPrivateReducer: PrivateMixReducerDef<(value: string) => Action[]> = container.myPrivateReducer = composer
              .private.mixReducer(() => (value: string) => [{
                target: [],
                key: 'dummy',
                args: [value]
              }]);
            assembler.wire();
            myOriginalPrivateReducer = container.myPrivateReducer;

            const proxy = composer.override(myOriginalPrivateReducer);
            let myNewPrivateReducer: PrivateMixReducerDef<(value: string) => Action[]> = container.myPrivateReducer = proxy
              .mixReducer(() => () => []);
            assembler.wire();
            myNewPrivateReducer = container.myPrivateReducer;
            expect(myOriginalPrivateReducer.access).toBe(DefAccess.private);
            expect(isMixReducerDef(myNewPrivateReducer, DefAccess.private)).toBe(true);
          });

          test('should throw error during wire if the parent is not a MixReducerDef', () => {
            container.myReducer = assembler.registerStaticProperty(createSchemaDef(() => new Schema('')));
            const proxy = composer.override(myOriginalReducer);
            container.myReducer = proxy.mixReducer(() => () => []);
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });
    });
  });
});
