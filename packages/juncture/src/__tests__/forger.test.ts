/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */
/* eslint-disable no-multi-assign */

import { Action } from '../context/action';
import { DefAccess, DefType, isDef } from '../definition/def';
import { PrvParamSelectorDef, PubParamSelectorDef } from '../definition/param-selector';
import { PrtReducerDef, PrvReducerDef, PubReducerDef } from '../definition/reducer';
import { createSchemaDef, Schema, SchemaDef } from '../definition/schema';
import { PrvSelectorDef, PubSelectorDef } from '../definition/selector';
import { PrtTriggerDef, PrvTriggerDef, PubTriggerDef } from '../definition/trigger';
import { PropertyAssembler } from '../fabric/property-assembler';
import { Forger, PrivateForger, ProtectedForger } from '../forger';
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

describe('ProtectedForger', () => {
  test('should be a class instantiable by passing a property assembler', () => {
    const forger = new ProtectedForger(assembler);
    expect(forger).toBeInstanceOf(ProtectedForger);
  });

  describe('instance', () => {
    let forger: ProtectedForger<MyJuncture>;
    beforeEach(() => {
      forger = new ProtectedForger<MyJuncture>(assembler);
    });

    describe('reducer', () => {
      test('should be a method', () => {
        expect(typeof forger.reducer).toBe('function');
      });

      test('should create, after property wiring, a protected ReducerDef, by passing a reducer function', () => {
        container.myDef = forger.reducer(({ value }) => () => value());
        assembler.wire();
        expect(isDef(container.myDef)).toBe(true);
        expect(container.myDef.type).toBe(DefType.reducer);
        expect(container.myDef.access).toBe(DefAccess.protected);
      });
    });

    describe('trigger', () => {
      test('should be a method', () => {
        expect(typeof forger.trigger).toBe('function');
      });

      test('should create, after property wiring, a protected TriggerDef, by passing a reducer function', () => {
        container.myDef = forger.trigger(() => () => []);
        assembler.wire();
        expect(isDef(container.myDef)).toBe(true);
        expect(container.myDef.type).toBe(DefType.trigger);
        expect(container.myDef.access).toBe(DefAccess.protected);
      });
    });
  });
});

describe('PrivateForger', () => {
  test('should be a class instantiable by passing a property assembler', () => {
    const forger = new PrivateForger(assembler);
    expect(forger).toBeInstanceOf(PrivateForger);
  });

  describe('instance', () => {
    let forger: PrivateForger<MyJuncture>;
    beforeEach(() => {
      forger = new PrivateForger<MyJuncture>(assembler);
    });

    describe('selector', () => {
      test('should be a method', () => {
        expect(typeof forger.selector).toBe('function');
      });

      test('should create, after property wiring, a private SelectorDef, by passing a selector function', () => {
        container.myDef = forger.selector(({ value }) => value());
        assembler.wire();
        expect(isDef(container.myDef)).toBe(true);
        expect(container.myDef.type).toBe(DefType.selector);
        expect(container.myDef.access).toBe(DefAccess.private);
      });
    });

    describe('paramSelector', () => {
      test('should be a method', () => {
        expect(typeof forger.paramSelector).toBe('function');
      });

      test('should create, after property wiring, a private ParamSelectorDef, by passing a selector function', () => {
        container.myDef = forger.paramSelector(() => (val: string) => val.length);
        assembler.wire();
        expect(isDef(container.myDef)).toBe(true);
        expect(container.myDef.type).toBe(DefType.paramSelector);
        expect(container.myDef.access).toBe(DefAccess.private);
      });
    });

    describe('reducer', () => {
      test('should be a method', () => {
        expect(typeof forger.reducer).toBe('function');
      });

      test('should create, after property wiring, a private ReducerDef, by passing a reducer function', () => {
        container.myDef = forger.reducer(({ value }) => () => value());
        assembler.wire();
        expect(isDef(container.myDef)).toBe(true);
        expect(container.myDef.type).toBe(DefType.reducer);
        expect(container.myDef.access).toBe(DefAccess.private);
      });
    });

    describe('trigger', () => {
      test('should be a method', () => {
        expect(typeof forger.trigger).toBe('function');
      });

      test('should create, after property wiring, a private TriggerDef, by passing a reducer function', () => {
        container.myDef = forger.trigger(() => () => []);
        assembler.wire();
        expect(isDef(container.myDef)).toBe(true);
        expect(container.myDef.type).toBe(DefType.trigger);
        expect(container.myDef.access).toBe(DefAccess.private);
      });
    });
  });
});

describe('Forger', () => {
  describe('constructor', () => {
    test('should accept a property assembler', () => {
      const forger = new Forger(assembler);
      expect(forger).toBeInstanceOf(Forger);
    });
  });

  describe('instance', () => {
    let forger: Forger<MyJuncture>;
    beforeEach(() => {
      forger = new Forger<MyJuncture>(assembler);
    });

    test('"protected" property should return a ProtectedForger instance', () => {
      expect(forger.protected).toBeInstanceOf(ProtectedForger);
    });

    test('"private" property should return a PrivateForger instance', () => {
      expect(forger.private).toBeInstanceOf(PrivateForger);
    });

    describe('selector', () => {
      test('should be a method', () => {
        expect(typeof forger.selector).toBe('function');
      });

      test('should create, after property wiring, a public SelectorDef, by passing a selector function', () => {
        container.myDef = forger.selector(({ value }) => value());
        assembler.wire();
        expect(isDef(container.myDef)).toBe(true);
        expect(container.myDef.type).toBe(DefType.selector);
        expect(container.myDef.access).toBe(DefAccess.public);
      });
    });

    describe('paramSelector', () => {
      test('should be a method', () => {
        expect(typeof forger.paramSelector).toBe('function');
      });

      test('should create, after property wiring, a public ParamSelectorDef, by passing a selector function', () => {
        container.myDef = forger.paramSelector(() => (val: string) => val.length);
        assembler.wire();
        expect(isDef(container.myDef)).toBe(true);
        expect(container.myDef.type).toBe(DefType.paramSelector);
        expect(container.myDef.access).toBe(DefAccess.public);
      });
    });

    describe('reducer', () => {
      test('should be a method', () => {
        expect(typeof forger.reducer).toBe('function');
      });

      test('should create, after property wiring, a public ReducerDef, by passing a reducer function', () => {
        container.myDef = forger.reducer(({ value }) => () => value());
        assembler.wire();
        expect(isDef(container.myDef)).toBe(true);
        expect(container.myDef.type).toBe(DefType.reducer);
        expect(container.myDef.access).toBe(DefAccess.public);
      });
    });

    describe('trigger', () => {
      test('should be a method', () => {
        expect(typeof forger.trigger).toBe('function');
      });

      test('should create, after property wiring, a public TriggerDef, by passing a reducer function', () => {
        container.myDef = forger.trigger(() => () => []);
        assembler.wire();
        expect(isDef(container.myDef)).toBe(true);
        expect(container.myDef.type).toBe(DefType.trigger);
        expect(container.myDef.access).toBe(DefAccess.public);
      });
    });

    describe('override', () => {
      test('should be a method', () => {
        expect(typeof forger.override).toBe('function');
      });

      describe('when incorrectly used', () => {
        test('should throw error during wire if the parent does not exists', () => {
          const myOriginalDef = forger.selector(() => 'original with different key');
          container.myOriginalDef = myOriginalDef;
          const proxy = forger.override(myOriginalDef);
          container.myNewDef = proxy.selector(({ value }) => value());
          expect(() => {
            assembler.wire();
          }).toThrow();
        });

        test('should throw error during wire if the parent is not a Def', () => {
          const myOriginalDef = forger.selector(() => 'original with different key');
          container.myOriginalDef = myOriginalDef;
          container.myNewDef = assembler.registerStaticProperty('This is not a Def');
          const proxy = forger.override(myOriginalDef);
          container.myNewDef = proxy.selector(({ value }) => value());
          expect(() => {
            assembler.wire();
          }).toThrow();
        });
      });

      describe('when passing a SelectorDef as type argument, proxy should provide access to', () => {
        let myOriginalDef: PubSelectorDef<string>;
        beforeEach(() => {
          myOriginalDef = container.myDef = forger.selector(() => 'original');
          assembler.wire();
          myOriginalDef = container.myDef;
        });

        describe('a "selector" property that', () => {
          test('should be a method', () => {
            const proxy = forger.override(myOriginalDef);
            expect(typeof proxy.selector).toBe('function');
          });

          test('should create, after property wiring, a new SelectorDef assignable to the parent, by passing a selector function', () => {
            const proxy = forger.override(myOriginalDef);
            let myNewDef: PubSelectorDef<string> = container.myDef = proxy.selector(({ value }) => value());
            assembler.wire();
            myNewDef = container.myDef;
            expect(isDef(myNewDef)).toBe(true);
            expect(myNewDef.type).toBe(DefType.selector);
            expect(myNewDef).not.toBe(myOriginalDef);
          });

          test('should provide access to the parent selector', () => {
            const proxy = forger.override(myOriginalDef);
            container.myDef = proxy.selector(({ parent }) => `${parent}2`);
            assembler.wire();
            const result = container.myDef[jSymbols.defPayload]();
            expect(result).toBe('original2');
          });

          test('should return a public SelectorDef if the parent is public', () => {
            const proxy = forger.override(myOriginalDef);
            let myNewDef = container.myDef = proxy.selector(({ value }) => value());
            assembler.wire();
            myNewDef = container.myDef;
            expect(myOriginalDef.access).toBe(DefAccess.public);
            expect(myNewDef.access).toBe(DefAccess.public);
          });

          test('should return a private SelectorDef if the parent is private', () => {
            let myOriginalPrivateDef: PrvSelectorDef<string> = container.myPrivateSelector = forger.private.selector(() => 'original');
            assembler.wire();
            myOriginalPrivateDef = container.myPrivateSelector;

            const proxy = forger.override(myOriginalPrivateDef);
            let myNewPrivateDef: PrvSelectorDef<string> = container.myPrivateSelector = proxy.selector(({ value }) => value());
            assembler.wire();
            myNewPrivateDef = container.myPrivateSelector;
            expect(myOriginalPrivateDef.access).toBe(DefAccess.private);
            expect(myNewPrivateDef.access).toBe(DefAccess.private);
          });

          test('should throw error during wire if the parent is not a SelectorDef', () => {
            container.myDef = assembler.registerStaticProperty(createSchemaDef(() => new Schema('')));
            const proxy = forger.override(myOriginalDef);
            container.myDef = proxy.selector(() => '');
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });

      describe('when passing a ParamSelectorDef as type argument, proxy should provide access to', () => {
        let myOriginalDef: PubParamSelectorDef<(value: string) => number>;
        beforeEach(() => {
          myOriginalDef = container.myDef = forger.paramSelector(() => (value: string) => value.length);
          assembler.wire();
          myOriginalDef = container.myDef;
        });

        describe('a "paramSelector" property that', () => {
          test('should be a method', () => {
            const proxy = forger.override(myOriginalDef);
            expect(typeof proxy.paramSelector).toBe('function');
          });

          test('should create, after property wiring, a new ParamSelectorDef assignable to the parent, by passing a selector function', () => {
            const proxy = forger.override(myOriginalDef);
            let myNewDef: PubParamSelectorDef<(value: string) => number> = container.myDef = proxy.paramSelector(() => () => 0);
            assembler.wire();
            myNewDef = container.myDef;
            expect(isDef(myNewDef)).toBe(true);
            expect(myNewDef.type).toBe(DefType.paramSelector);
            expect(myNewDef).not.toBe(myOriginalDef);
          });

          test('should provide access to the parent paramSelector', () => {
            const proxy = forger.override(myOriginalDef);
            container.myDef = proxy.paramSelector(({ parent }) => () => parent('abc'));
            assembler.wire();
            const result = container.myDef[jSymbols.defPayload]()();
            expect(result).toBe(3);
          });

          test('should return a public ParamSelectorDef if the parent is public', () => {
            const proxy = forger.override(myOriginalDef);
            let myNewDef: PubParamSelectorDef<(value: string) => number> = container.myDef = proxy.paramSelector(() => () => 0);
            assembler.wire();
            myNewDef = container.myDef;
            expect(myOriginalDef.access).toBe(DefAccess.public);
            expect(myNewDef.access).toBe(DefAccess.public);
          });

          test('should return a private ParamSelectorDef if the parent is private', () => {
            let myOriginalPrivateDef: PrvParamSelectorDef<(value: string) => number> = container
              .myPrivateSelector = forger.private.paramSelector(() => (value: string) => value.length);
            assembler.wire();
            myOriginalPrivateDef = container.myPrivateSelector;

            const proxy = forger.override(myOriginalPrivateDef);
            let myNewPrivateDef: PrvParamSelectorDef<(value: string) => number> = container.myPrivateSelector = proxy.paramSelector(() => () => 0);
            assembler.wire();
            myNewPrivateDef = container.myPrivateSelector;
            expect(myOriginalPrivateDef.access).toBe(DefAccess.private);
            expect(myNewPrivateDef.access).toBe(DefAccess.private);
          });

          test('should throw error during wire if the parent is not a ParamSelectorDef', () => {
            container.myDef = assembler.registerStaticProperty(createSchemaDef(() => new Schema('')));
            const proxy = forger.override(myOriginalDef);
            container.myDef = proxy.paramSelector(() => () => '');
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });

      describe('when passing a ReducerDef as type argument, proxy should provide access to', () => {
        let myOriginalDef: PubReducerDef<(value: string) => string>;
        beforeEach(() => {
          myOriginalDef = container.myDef = forger.reducer(() => (value: string) => value.toUpperCase());
          assembler.wire();
          myOriginalDef = container.myDef;
        });

        describe('a "reducer" property that', () => {
          test('should be a method', () => {
            const proxy = forger.override(myOriginalDef);
            expect(typeof proxy.reducer).toBe('function');
          });

          test('should create, after property wiring, a new ReducerDef assignable to the parent, by passing a reducer function', () => {
            const proxy = forger.override(myOriginalDef);
            let myNewDef: PubReducerDef<(value: string) => string> = container.myDef = proxy
              .reducer(() => (value: string) => value);
            assembler.wire();
            myNewDef = container.myDef;
            expect(isDef(myNewDef)).toBe(true);
            expect(myNewDef.type).toBe(DefType.reducer);
            expect(myNewDef).not.toBe(myOriginalDef);
          });

          test('should provide access to the parent reducer', () => {
            const proxy = forger.override(myOriginalDef);
            container.myDef = proxy.reducer(({ parent }) => (value: string) => parent(`${value}2`));
            assembler.wire();
            const result = container.myDef[jSymbols.defPayload]()('abc');
            expect(result).toBe('ABC2');
          });

          test('should return a public ReducerDef if the parent is public', () => {
            const proxy = forger.override(myOriginalDef);
            let myNewDef = container.myDef = proxy.reducer(() => (value: string) => value);
            assembler.wire();
            myNewDef = container.myDef;
            expect(myOriginalDef.access).toBe(DefAccess.public);
            expect(myNewDef.access).toBe(DefAccess.public);
          });

          test('should return a protected ReducerDef if the parent is protected', () => {
            let myOriginalProtectedDef: PrtReducerDef<(value: string) => string> = container.myProtectedDef = forger
              .protected.reducer(() => (value: string) => value.toUpperCase());
            assembler.wire();
            myOriginalProtectedDef = container.myProtectedDef;

            const proxy = forger.override(myOriginalProtectedDef);
            let myNewProtectedDef: PrtReducerDef<(value: string) => string> = container.myProtectedDef = proxy
              .reducer(() => (value: string) => value);
            assembler.wire();
            myNewProtectedDef = container.myProtectedDef;
            expect(myOriginalProtectedDef.access).toBe(DefAccess.protected);
            expect(myNewProtectedDef.access).toBe(DefAccess.protected);
          });

          test('should return a private ReducerDef if the parent is private', () => {
            let myOriginalPrivateDef: PrvReducerDef<(value: string) => string> = container.myPrivateReducer = forger
              .private.reducer(() => (value: string) => value.toUpperCase());
            assembler.wire();
            myOriginalPrivateDef = container.myPrivateReducer;

            const proxy = forger.override(myOriginalPrivateDef);
            let myNewPrivateDef: PrvReducerDef<(value: string) => string> = container.myPrivateReducer = proxy
              .reducer(() => (value: string) => value);
            assembler.wire();
            myNewPrivateDef = container.myPrivateReducer;
            expect(myOriginalPrivateDef.access).toBe(DefAccess.private);
            expect(myNewPrivateDef.access).toBe(DefAccess.private);
          });

          test('should throw error during wire if the parent is not a ReducerDef', () => {
            container.myDef = assembler.registerStaticProperty(createSchemaDef(() => new Schema('')));
            const proxy = forger.override(myOriginalDef);
            container.myDef = proxy.reducer(() => () => '');
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });

      describe('when passing a TriggerDef as type argument, proxy should provide access to', () => {
        let myOriginalDef: PubTriggerDef<(value: string) => Action[]>;
        beforeEach(() => {
          myOriginalDef = container.myDef = forger.trigger(() => (value: string) => [{
            target: [],
            key: 'dummy',
            args: [value]
          }]);
          assembler.wire();
          myOriginalDef = container.myDef;
        });

        describe('a "trigger" property that', () => {
          test('should be a method', () => {
            const proxy = forger.override(myOriginalDef);
            expect(typeof proxy.trigger).toBe('function');
          });

          test('should create, after property wiring, a new TriggerDef assignable to the parent, by passing a reducer function', () => {
            const proxy = forger.override(myOriginalDef);
            let myNewDef: PubTriggerDef<(value: string) => Action[]> = container.myDef = proxy
              .trigger(() => () => []);
            assembler.wire();
            myNewDef = container.myDef;
            expect(isDef(myNewDef)).toBe(true);
            expect(myNewDef.type).toBe(DefType.trigger);
            expect(myNewDef).not.toBe(myOriginalDef);
          });

          test('should provide access to the parent trigger', () => {
            const proxy = forger.override(myOriginalDef);
            container.myDef = proxy.trigger(({ parent }) => (value: string) => parent(`${value}2`));
            assembler.wire();
            const result = container.myDef[jSymbols.defPayload]()('abc');
            expect(result).toEqual([{
              target: [],
              key: 'dummy',
              args: ['abc2']
            }]);
          });

          test('should return a public TriggerDef if the parent is public', () => {
            const proxy = forger.override(myOriginalDef);
            let myNewDef = container.myDef = proxy.trigger(() => () => []);
            assembler.wire();
            myNewDef = container.myDef;
            expect(myOriginalDef.access).toBe(DefAccess.public);
            expect(myNewDef.access).toBe(DefAccess.public);
          });

          test('should return a protected TriggerDef if the parent is protected', () => {
            let myOriginalProtectedDef: PrtTriggerDef<(value: string) => Action[]> = container.myProtectedDef = forger
              .protected.trigger(() => (value: string) => [{
                target: [],
                key: 'dummy',
                args: [value]
              }]);
            assembler.wire();
            myOriginalProtectedDef = container.myProtectedDef;

            const proxy = forger.override(myOriginalProtectedDef);
            let myNewProtectedDef: PrtTriggerDef<(value: string) => Action[]> = container.myProtectedDef = proxy
              .trigger(() => () => []);
            assembler.wire();
            myNewProtectedDef = container.myProtectedDef;
            expect(myOriginalProtectedDef.access).toBe(DefAccess.protected);
            expect(myNewProtectedDef.access).toBe(DefAccess.protected);
          });

          test('should return a private TriggerDef if the parent is private', () => {
            let myOriginalPrivateDef: PrvTriggerDef<(value: string) => Action[]> = container.myPrivateReducer = forger
              .private.trigger(() => (value: string) => [{
                target: [],
                key: 'dummy',
                args: [value]
              }]);
            assembler.wire();
            myOriginalPrivateDef = container.myPrivateReducer;

            const proxy = forger.override(myOriginalPrivateDef);
            let myNewPrivateDef: PrvTriggerDef<(value: string) => Action[]> = container.myPrivateReducer = proxy
              .trigger(() => () => []);
            assembler.wire();
            myNewPrivateDef = container.myPrivateReducer;
            expect(myOriginalPrivateDef.access).toBe(DefAccess.private);
            expect(myNewPrivateDef.access).toBe(DefAccess.private);
          });

          test('should throw error during wire if the parent is not a TriggerDef', () => {
            container.myDef = assembler.registerStaticProperty(createSchemaDef(() => new Schema('')));
            const proxy = forger.override(myOriginalDef);
            container.myDef = proxy.trigger(() => () => []);
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });
    });
  });
});
