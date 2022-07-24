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
import { isPrivate, Private } from '../definition/private';
import {
  Action, isMixReducerDef, isPlainReducerDef, MixReducerDef, PlainReducerDef
} from '../definition/reducer';
import { createSchemaDef, Schema, SchemaDef } from '../definition/schema';
import {
  DirectSelectorDef, isDirectSelectorDef, isParamSelectorDef, ParamSelectorDef
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

    describe('"selector" property', () => {
      test('should be a function', () => {
        expect(typeof composer.selector).toBe('function');
      });

      test('should create, after property wiring, a Private DirectSelectorDef, by passing a selector function', () => {
        container.mySelector = composer.selector(({ value }) => value());
        assembler.wire();
        expect(isDirectSelectorDef(container.mySelector)).toBe(true);
        expect(container.mySelector.access).toBe('private');
      });
    });

    describe('"paramSelector" property', () => {
      test('should be a function', () => {
        expect(typeof composer.paramSelector).toBe('function');
      });

      test('should create, after property wiring, a Private ParamSelectorDef, by passing a selector function', () => {
        container.mySelector = composer.paramSelector(() => (val: string) => val.length);
        assembler.wire();
        expect(isParamSelectorDef(container.mySelector)).toBe(true);
        expect(container.mySelector.access).toBe('private');
      });
    });

    describe('"reducer" property', () => {
      test('should be a function', () => {
        expect(typeof composer.reducer).toBe('function');
      });

      test('should create, after property wiring, a Private PlainReducerDef, by passing a reducer function', () => {
        container.myReducer = composer.reducer(({ value }) => () => value());
        assembler.wire();
        expect(isPlainReducerDef(container.myReducer)).toBe(true);
        expect(container.myReducer.access).toBe('private');
      });
    });

    describe('"mixReducer" property', () => {
      test('should be a function', () => {
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

    describe('"selector" property', () => {
      test('should be a function', () => {
        expect(typeof composer.selector).toBe('function');
      });

      test('should create, after property wiring, a DirectSelectorDef, by passing a selector function', () => {
        container.mySelector = composer.selector(({ value }) => value());
        assembler.wire();
        expect(isDirectSelectorDef(container.mySelector)).toBe(true);
      });
    });

    describe('"paramSelector" property', () => {
      test('should be a function', () => {
        expect(typeof composer.paramSelector).toBe('function');
      });

      test('should create, after property wiring, a ParamSelectorDef, by passing a selector function', () => {
        container.mySelector = composer.paramSelector(() => (val: string) => val.length);
        assembler.wire();
        expect(isParamSelectorDef(container.mySelector)).toBe(true);
      });
    });

    describe('"reducer" property', () => {
      test('should be a function', () => {
        expect(typeof composer.reducer).toBe('function');
      });

      test('should create, after property wiring, a PlainReducerDef, by passing a reducer function', () => {
        container.myReducer = composer.reducer(({ value }) => () => value());
        assembler.wire();
        expect(isPlainReducerDef(container.myReducer)).toBe(true);
      });
    });

    describe('"mixReducer" property', () => {
      test('should be a function', () => {
        expect(typeof composer.mixReducer).toBe('function');
      });

      test('should create, after property wiring, a MixReducerDef, by passing a reducer function', () => {
        container.myReducer = composer.mixReducer(() => () => []);
        assembler.wire();
        expect(isMixReducerDef(container.myReducer)).toBe(true);
      });
    });

    describe('"override" property', () => {
      test('should be a function', () => {
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

      describe('when passing a DirectSelectorDef as type argument, proxy should provide access to', () => {
        let myOriginalSelector: DirectSelectorDef<string>;
        beforeEach(() => {
          myOriginalSelector = container.mySelector = composer.selector(() => 'original');
          assembler.wire();
          myOriginalSelector = container.mySelector;
        });

        describe('a "selector" property that', () => {
          test('should be a function', () => {
            const proxy = composer.override(myOriginalSelector);
            expect(typeof proxy.selector).toBe('function');
          });

          test('should create, after property wiring, a new DirectSelectorDef assignable to the parent, by passing a selector function', () => {
            const proxy = composer.override(myOriginalSelector);
            let myNewSelector: DirectSelectorDef<string> = container.mySelector = proxy.selector(({ value }) => value());
            assembler.wire();
            myNewSelector = container.mySelector;
            expect(isDirectSelectorDef(myNewSelector)).toBe(true);
            expect(myNewSelector).not.toBe(myOriginalSelector);
          });

          test('should provide access to the parent selector', () => {
            const proxy = composer.override(myOriginalSelector);
            container.mySelector = proxy.selector(({ parent }) => `${parent}2`);
            assembler.wire();
            const result = container.mySelector[jSymbols.defPayload]();
            expect(result).toBe('original2');
          });

          test('should return a non-private DirectSelectorDef if the parent is not private', () => {
            const proxy = composer.override(myOriginalSelector);
            let myNewSelector = container.mySelector = proxy.selector(({ value }) => value());
            assembler.wire();
            myNewSelector = container.mySelector;
            expect(isPrivate(myOriginalSelector)).toBe(false);
            expect(isDirectSelectorDef(myNewSelector)).toBe(true);
            expect(isPrivate(myNewSelector)).toBe(false);
          });

          test('should return a private DirectSelectorDef if the parent is private', () => {
            let myOriginalPrivateSelector: Private<DirectSelectorDef<string>> = container.myPrivateSelector = composer.private.selector(() => 'original');
            assembler.wire();
            myOriginalPrivateSelector = container.myPrivateSelector;

            const proxy = composer.override(myOriginalPrivateSelector);
            let myNewPrivateSelector: Private<DirectSelectorDef<string>> = container.myPrivateSelector = proxy.selector(({ value }) => value());
            assembler.wire();
            myNewPrivateSelector = container.myPrivateSelector;
            expect(isPrivate(myOriginalPrivateSelector)).toBe(true);
            expect(isDirectSelectorDef(myNewPrivateSelector)).toBe(true);
            expect(isPrivate(myNewPrivateSelector)).toBe(true);
          });

          test('should throw error during wire if the parent is not a DirectSelectorDef', () => {
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
          test('should be a function', () => {
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

          test('should return a non-private ParamSelectorDef if the parent is not private', () => {
            const proxy = composer.override(myOriginalSelector);
            let myNewSelector: ParamSelectorDef<(value: string) => number> = container.mySelector = proxy.paramSelector(() => () => 0);
            assembler.wire();
            myNewSelector = container.mySelector;
            expect(isPrivate(myOriginalSelector)).toBe(false);
            expect(isParamSelectorDef(myNewSelector)).toBe(true);
            expect(isPrivate(myNewSelector)).toBe(false);
          });

          test('should return a private ParamSelectorDef if the parent is private', () => {
            let myOriginalPrivateSelector: Private<ParamSelectorDef<(value: string) => number>> = container
              .myPrivateSelector = composer.private.paramSelector(() => (value: string) => value.length);
            assembler.wire();
            myOriginalPrivateSelector = container.myPrivateSelector;

            const proxy = composer.override(myOriginalPrivateSelector);
            let myNewPrivateSelector: Private<ParamSelectorDef<(value: string) => number>> = container.myPrivateSelector = proxy.paramSelector(() => () => 0);
            assembler.wire();
            myNewPrivateSelector = container.myPrivateSelector;
            expect(isPrivate(myOriginalPrivateSelector)).toBe(true);
            expect(isParamSelectorDef(myNewPrivateSelector)).toBe(true);
            expect(isPrivate(myNewPrivateSelector)).toBe(true);
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

      describe('when passing a PlainReducerDef as type argument, proxy should provide access to', () => {
        let myOriginalReducer: PlainReducerDef<(value: string) => string>;
        beforeEach(() => {
          myOriginalReducer = container.myReducer = composer.reducer(() => (value: string) => value.toUpperCase());
          assembler.wire();
          myOriginalReducer = container.myReducer;
        });

        describe('a "reducer" property that', () => {
          test('should be a function', () => {
            const proxy = composer.override(myOriginalReducer);
            expect(typeof proxy.reducer).toBe('function');
          });

          test('should create, after property wiring, a new PlainReducerDef assignable to the parent, by passing a reducer function', () => {
            const proxy = composer.override(myOriginalReducer);
            let myNewReducer: PlainReducerDef<(value: string) => string> = container.myReducer = proxy
              .reducer(() => (value: string) => value);
            assembler.wire();
            myNewReducer = container.myReducer;
            expect(isPlainReducerDef(myNewReducer)).toBe(true);
            expect(myNewReducer).not.toBe(myOriginalReducer);
          });

          test('should provide access to the parent reducer', () => {
            const proxy = composer.override(myOriginalReducer);
            container.myReducer = proxy.reducer(({ parent }) => (value: string) => parent(`${value}2`));
            assembler.wire();
            const result = container.myReducer[jSymbols.defPayload]()('abc');
            expect(result).toBe('ABC2');
          });

          test('should return a non-private PlainReducerDef if the parent is not private', () => {
            const proxy = composer.override(myOriginalReducer);
            let myNewReducer = container.myReducer = proxy.reducer(() => (value: string) => value);
            assembler.wire();
            myNewReducer = container.myReducer;
            expect(isPrivate(myOriginalReducer)).toBe(false);
            expect(isPlainReducerDef(myNewReducer)).toBe(true);
            expect(isPrivate(myNewReducer)).toBe(false);
          });

          test('should return a private PlainReducerDef if the parent is private', () => {
            let myOriginalPrivateReducer: Private<PlainReducerDef<(value: string) => string>> = container.myPrivateReducer = composer
              .private.reducer(() => (value: string) => value.toUpperCase());
            assembler.wire();
            myOriginalPrivateReducer = container.myPrivateReducer;

            const proxy = composer.override(myOriginalPrivateReducer);
            let myNewPrivateReducer: Private<PlainReducerDef<(value: string) => string>> = container.myPrivateReducer = proxy
              .reducer(() => (value: string) => value);
            assembler.wire();
            myNewPrivateReducer = container.myPrivateReducer;
            expect(isPrivate(myOriginalPrivateReducer)).toBe(true);
            expect(isPlainReducerDef(myNewPrivateReducer)).toBe(true);
            expect(isPrivate(myNewPrivateReducer)).toBe(true);
          });

          test('should throw error during wire if the parent is not a PlainReducerDef', () => {
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
          test('should be a function', () => {
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

          test('should return a non-private MixReducerDef if the parent is not private', () => {
            const proxy = composer.override(myOriginalReducer);
            let myNewReducer = container.myReducer = proxy.mixReducer(() => () => []);
            assembler.wire();
            myNewReducer = container.myReducer;
            expect(isPrivate(myOriginalReducer)).toBe(false);
            expect(isMixReducerDef(myNewReducer)).toBe(true);
            expect(isPrivate(myNewReducer)).toBe(false);
          });

          test('should return a private MixReducerDef if the parent is private', () => {
            let myOriginalPrivateReducer: Private<MixReducerDef<(value: string) => Action[]>> = container.myPrivateReducer = composer
              .private.mixReducer(() => (value: string) => [{
                target: [],
                key: 'dummy',
                args: [value]
              }]);
            assembler.wire();
            myOriginalPrivateReducer = container.myPrivateReducer;

            const proxy = composer.override(myOriginalPrivateReducer);
            let myNewPrivateReducer: Private<MixReducerDef<(value: string) => Action[]>> = container.myPrivateReducer = proxy
              .mixReducer(() => () => []);
            assembler.wire();
            myNewPrivateReducer = container.myPrivateReducer;
            expect(isPrivate(myOriginalPrivateReducer)).toBe(true);
            expect(isMixReducerDef(myNewPrivateReducer)).toBe(true);
            expect(isPrivate(myNewPrivateReducer)).toBe(true);
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
