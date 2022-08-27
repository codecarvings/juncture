/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */
/* eslint-disable no-multi-assign */

import { AccessModifier } from '../access';
import { isDescriptor } from '../design/descriptor';
import { DescriptorType } from '../design/descriptor-type';
import { ParamSelector, PrivateParamSelector } from '../design/descriptors/param-selector';
import { PrivateReducer, Reducer } from '../design/descriptors/reducer';
import { createSchema, Schema } from '../design/descriptors/schema';
import { PrivateSelector, Selector } from '../design/descriptors/selector';
import { PrivateTrigger, Trigger } from '../design/descriptors/trigger';
import { JunctureSchema } from '../design/schema';
import { Driver } from '../driver';
import { Instruction } from '../engine/instruction';
import { Forger, PrivateForger } from '../forger';
import { jSymbols } from '../symbols';
import { PropertyAssembler } from '../tool/property-assembler';

interface MyDriver extends Driver {
  schema: Schema<JunctureSchema<string>>;
}

let container: any;
let assembler: PropertyAssembler;
beforeEach(() => {
  container = { };
  assembler = new PropertyAssembler(container);
});

describe('PrivateForger', () => {
  test('should be a class instantiable by passing a property assembler', () => {
    const forger = new PrivateForger(assembler);
    expect(forger).toBeInstanceOf(PrivateForger);
  });

  describe('instance', () => {
    let forger: PrivateForger<MyDriver>;
    beforeEach(() => {
      forger = new PrivateForger<MyDriver>(assembler);
    });

    describe('selector', () => {
      test('should be a method', () => {
        expect(typeof forger.selector).toBe('function');
      });

      test('should create, after property wiring, a PrivateSelector, by passing a selector function', () => {
        container.myDesc = forger.selector(({ value }) => value());
        assembler.wire();
        expect(isDescriptor(container.myDesc)).toBe(true);
        expect(container.myDesc.type).toBe(DescriptorType.selector);
        expect(container.myDesc.access).toBe(AccessModifier.private);
      });
    });

    describe('paramSelector', () => {
      test('should be a method', () => {
        expect(typeof forger.paramSelector).toBe('function');
      });

      test('should create, after property wiring, a PrivateParamSelector, by passing a selector function', () => {
        container.myDesc = forger.paramSelector(() => (val: string) => val.length);
        assembler.wire();
        expect(isDescriptor(container.myDesc)).toBe(true);
        expect(container.myDesc.type).toBe(DescriptorType.paramSelector);
        expect(container.myDesc.access).toBe(AccessModifier.private);
      });
    });

    describe('trigger', () => {
      test('should be a method', () => {
        expect(typeof forger.trigger).toBe('function');
      });

      test('should create, after property wiring, a PrivateTrigger, by passing a trigger function', () => {
        container.myDesc = forger.trigger(() => () => []);
        assembler.wire();
        expect(isDescriptor(container.myDesc)).toBe(true);
        expect(container.myDesc.type).toBe(DescriptorType.trigger);
        expect(container.myDesc.access).toBe(AccessModifier.private);
      });
    });

    describe('reducer', () => {
      test('should be a method', () => {
        expect(typeof forger.reducer).toBe('function');
      });

      test('should create, after property wiring, a PrivateReducer, by passing a reducer function', () => {
        container.myDesc = forger.reducer(({ value }) => () => value());
        assembler.wire();
        expect(isDescriptor(container.myDesc)).toBe(true);
        expect(container.myDesc.type).toBe(DescriptorType.reducer);
        expect(container.myDesc.access).toBe(AccessModifier.private);
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

    test('should accept a driver', () => {
      class MyDriver2 extends Driver {
        schema = createSchema(() => new JunctureSchema(''));
      }
      const driver = new MyDriver2();
      const forger = new Forger(driver);
      expect(forger).toBeInstanceOf(Forger);
    });
  });

  describe('instance', () => {
    let forger: Forger<MyDriver>;
    beforeEach(() => {
      forger = new Forger<MyDriver>(assembler);
    });

    test('"private" property should return a PrivateForger instance', () => {
      expect(forger.private).toBeInstanceOf(PrivateForger);
    });

    describe('selector', () => {
      test('should be a method', () => {
        expect(typeof forger.selector).toBe('function');
      });

      test('should create, after property wiring, a Selector, by passing a selector function', () => {
        container.myDesc = forger.selector(({ value }) => value());
        assembler.wire();
        expect(isDescriptor(container.myDesc)).toBe(true);
        expect(container.myDesc.type).toBe(DescriptorType.selector);
        expect(container.myDesc.access).toBe(AccessModifier.public);
      });
    });

    describe('paramSelector', () => {
      test('should be a method', () => {
        expect(typeof forger.paramSelector).toBe('function');
      });

      test('should create, after property wiring, a ParamSelector, by passing a selector function', () => {
        container.myDesc = forger.paramSelector(() => (val: string) => val.length);
        assembler.wire();
        expect(isDescriptor(container.myDesc)).toBe(true);
        expect(container.myDesc.type).toBe(DescriptorType.paramSelector);
        expect(container.myDesc.access).toBe(AccessModifier.public);
      });
    });

    describe('trigger', () => {
      test('should be a method', () => {
        expect(typeof forger.trigger).toBe('function');
      });

      test('should create, after property wiring, a Trigger, by passing a trigger function', () => {
        container.myDesc = forger.trigger(() => () => []);
        assembler.wire();
        expect(isDescriptor(container.myDesc)).toBe(true);
        expect(container.myDesc.type).toBe(DescriptorType.trigger);
        expect(container.myDesc.access).toBe(AccessModifier.public);
      });
    });

    describe('reducer', () => {
      test('should be a method', () => {
        expect(typeof forger.reducer).toBe('function');
      });

      test('should create, after property wiring, a Reducer, by passing a reducer function', () => {
        container.myDesc = forger.reducer(({ value }) => () => value());
        assembler.wire();
        expect(isDescriptor(container.myDesc)).toBe(true);
        expect(container.myDesc.type).toBe(DescriptorType.reducer);
        expect(container.myDesc.access).toBe(AccessModifier.public);
      });
    });

    describe('override', () => {
      test('should be a method', () => {
        expect(typeof forger.override).toBe('function');
      });

      describe('when incorrectly used', () => {
        test('should throw error during wire if the parent does not exists', () => {
          const myOriginalDesc = forger.selector(() => 'original with different key');
          container.myOriginalDesc = myOriginalDesc;
          const proxy = forger.override(myOriginalDesc);
          container.myNewDesc = proxy.selector(({ value }) => value());
          expect(() => {
            assembler.wire();
          }).toThrow();
        });

        test('should throw error during wire if the parent is not a Descriptor', () => {
          const myOriginalDesc = forger.selector(() => 'original with different key');
          container.myOriginalDesc = myOriginalDesc;
          container.myNewDesc = assembler.registerStaticProperty('This is not a Descriptor');
          const proxy = forger.override(myOriginalDesc);
          container.myNewDesc = proxy.selector(({ value }) => value());
          expect(() => {
            assembler.wire();
          }).toThrow();
        });
      });

      describe('when passing a Selector as type argument, proxy should provide access to', () => {
        let myOriginalDesc: Selector<string>;
        beforeEach(() => {
          myOriginalDesc = container.myDesc = forger.selector(() => 'original');
          assembler.wire();
          myOriginalDesc = container.myDesc;
        });

        describe('a "selector" property that', () => {
          test('should be a method', () => {
            const proxy = forger.override(myOriginalDesc);
            expect(typeof proxy.selector).toBe('function');
          });

          test('should create, after property wiring, a new Selector assignable to the parent, by passing a selector function', () => {
            const proxy = forger.override(myOriginalDesc);
            let myNewDesc: Selector<string> = container.myDesc = proxy.selector(({ value }) => value());
            assembler.wire();
            myNewDesc = container.myDesc;
            expect(isDescriptor(myNewDesc)).toBe(true);
            expect(myNewDesc.type).toBe(DescriptorType.selector);
            expect(myNewDesc).not.toBe(myOriginalDesc);
          });

          test('should provide access to the parent selector', () => {
            const proxy = forger.override(myOriginalDesc);
            container.myDesc = proxy.selector(({ parent }) => `${parent}2`);
            assembler.wire();
            const result = container.myDesc[jSymbols.payload]();
            expect(result).toBe('original2');
          });

          test('should return a  Selector if the parent is public', () => {
            const proxy = forger.override(myOriginalDesc);
            let myNewDesc = container.myDesc = proxy.selector(({ value }) => value());
            assembler.wire();
            myNewDesc = container.myDesc;
            expect(myOriginalDesc.access).toBe(AccessModifier.public);
            expect(myNewDesc.access).toBe(AccessModifier.public);
          });

          test('should return a PrivateSelector if the parent is private', () => {
            let myOriginalPrivateDesc: PrivateSelector<string> = container.myPrivateSelector = forger.private.selector(() => 'original');
            assembler.wire();
            myOriginalPrivateDesc = container.myPrivateSelector;

            const proxy = forger.override(myOriginalPrivateDesc);
            let myNewPrivateDesc: PrivateSelector<string> = container.myPrivateSelector = proxy.selector(({ value }) => value());
            assembler.wire();
            myNewPrivateDesc = container.myPrivateSelector;
            expect(myOriginalPrivateDesc.access).toBe(AccessModifier.private);
            expect(myNewPrivateDesc.access).toBe(AccessModifier.private);
          });

          test('should throw error during wire if the parent is not a Selector', () => {
            container.myDesc = assembler.registerStaticProperty(createSchema(() => new JunctureSchema('')));
            const proxy = forger.override(myOriginalDesc);
            container.myDesc = proxy.selector(() => '');
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });

      describe('when passing a ParamSelector as type argument, proxy should provide access to', () => {
        let myOriginalDesc: ParamSelector<(value: string) => number>;
        beforeEach(() => {
          myOriginalDesc = container.myDesc = forger.paramSelector(() => (value: string) => value.length);
          assembler.wire();
          myOriginalDesc = container.myDesc;
        });

        describe('a "paramSelector" property that', () => {
          test('should be a method', () => {
            const proxy = forger.override(myOriginalDesc);
            expect(typeof proxy.paramSelector).toBe('function');
          });

          test('should create, after property wiring, a new ParamSelector assignable to the parent, by passing a selector function', () => {
            const proxy = forger.override(myOriginalDesc);
            let myNewDesc: ParamSelector<(value: string) => number> = container.myDesc = proxy.paramSelector(() => () => 0);
            assembler.wire();
            myNewDesc = container.myDesc;
            expect(isDescriptor(myNewDesc)).toBe(true);
            expect(myNewDesc.type).toBe(DescriptorType.paramSelector);
            expect(myNewDesc).not.toBe(myOriginalDesc);
          });

          test('should provide access to the parent paramSelector', () => {
            const proxy = forger.override(myOriginalDesc);
            container.myDesc = proxy.paramSelector(({ parent }) => () => parent('abc'));
            assembler.wire();
            const result = container.myDesc[jSymbols.payload]()();
            expect(result).toBe(3);
          });

          test('should return a ParamSelector if the parent is public', () => {
            const proxy = forger.override(myOriginalDesc);
            let myNewDesc: ParamSelector<(value: string) => number> = container.myDesc = proxy.paramSelector(() => () => 0);
            assembler.wire();
            myNewDesc = container.myDesc;
            expect(myOriginalDesc.access).toBe(AccessModifier.public);
            expect(myNewDesc.access).toBe(AccessModifier.public);
          });

          test('should return a PrivateParamSelector if the parent is private', () => {
            let myOriginalPrivateDesc: PrivateParamSelector<(value: string) => number> = container
              .myPrivateSelector = forger.private.paramSelector(() => (value: string) => value.length);
            assembler.wire();
            myOriginalPrivateDesc = container.myPrivateSelector;

            const proxy = forger.override(myOriginalPrivateDesc);
            let myNewPrivateDesc: PrivateParamSelector<(value: string) => number> = container.myPrivateSelector = proxy.paramSelector(() => () => 0);
            assembler.wire();
            myNewPrivateDesc = container.myPrivateSelector;
            expect(myOriginalPrivateDesc.access).toBe(AccessModifier.private);
            expect(myNewPrivateDesc.access).toBe(AccessModifier.private);
          });

          test('should throw error during wire if the parent is not a ParamSelector', () => {
            container.myDesc = assembler.registerStaticProperty(createSchema(() => new JunctureSchema('')));
            const proxy = forger.override(myOriginalDesc);
            container.myDesc = proxy.paramSelector(() => () => '');
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });

      describe('when passing a Trigger as type argument, proxy should provide access to', () => {
        let myOriginalDesc: Trigger<(value: string) => Instruction[]>;
        beforeEach(() => {
          myOriginalDesc = container.myDesc = forger.trigger(() => (value: string) => [{
            target: null!,
            key: 'dummy',
            payload: [value]
          }]);
          assembler.wire();
          myOriginalDesc = container.myDesc;
        });

        describe('a "trigger" property that', () => {
          test('should be a method', () => {
            const proxy = forger.override(myOriginalDesc);
            expect(typeof proxy.trigger).toBe('function');
          });

          test('should create, after property wiring, a new Trigger assignable to the parent, by passing a trigger function', () => {
            const proxy = forger.override(myOriginalDesc);
            let myNewDesc: Trigger<(value: string) => Instruction[]> = container.myDesc = proxy
              .trigger(() => () => []);
            assembler.wire();
            myNewDesc = container.myDesc;
            expect(isDescriptor(myNewDesc)).toBe(true);
            expect(myNewDesc.type).toBe(DescriptorType.trigger);
            expect(myNewDesc).not.toBe(myOriginalDesc);
          });

          test('should provide access to the parent trigger', () => {
            const proxy = forger.override(myOriginalDesc);
            container.myDesc = proxy.trigger(({ parent }) => (value: string) => parent(`${value}2`));
            assembler.wire();
            const result = container.myDesc[jSymbols.payload]()('abc');
            expect(result).toEqual([{
              target: null,
              key: 'dummy',
              payload: ['abc2']
            }]);
          });

          test('should return a Trigger if the parent is public', () => {
            const proxy = forger.override(myOriginalDesc);
            let myNewDesc = container.myDesc = proxy.trigger(() => () => []);
            assembler.wire();
            myNewDesc = container.myDesc;
            expect(myOriginalDesc.access).toBe(AccessModifier.public);
            expect(myNewDesc.access).toBe(AccessModifier.public);
          });

          test('should return a PrivateTrigger if the parent is private', () => {
            let myOriginalPrivateDesc: PrivateTrigger<(value: string) => Instruction[]> = container.myPrivateDesc = forger
              .private.trigger(() => (value: string) => [{
                target: null!,
                key: 'dummy',
                payload: [value]
              }]);
            assembler.wire();
            myOriginalPrivateDesc = container.myPrivateDesc;

            const proxy = forger.override(myOriginalPrivateDesc);
            let myNewPrivateDesc: PrivateTrigger<(value: string) => Instruction[]> = container.myPrivateDesc = proxy
              .trigger(() => () => []);
            assembler.wire();
            myNewPrivateDesc = container.myPrivateDesc;
            expect(myOriginalPrivateDesc.access).toBe(AccessModifier.private);
            expect(myNewPrivateDesc.access).toBe(AccessModifier.private);
          });

          test('should throw error during wire if the parent is not a Trigger', () => {
            container.myDesc = assembler.registerStaticProperty(createSchema(() => new JunctureSchema('')));
            const proxy = forger.override(myOriginalDesc);
            container.myDesc = proxy.trigger(() => () => []);
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });

      describe('when passing a Reducer as type argument, proxy should provide access to', () => {
        let myOriginalDesc: Reducer<(value: string) => string>;
        beforeEach(() => {
          myOriginalDesc = container.myDesc = forger.reducer(() => (value: string) => value.toUpperCase());
          assembler.wire();
          myOriginalDesc = container.myDesc;
        });

        describe('a "reducer" property that', () => {
          test('should be a method', () => {
            const proxy = forger.override(myOriginalDesc);
            expect(typeof proxy.reducer).toBe('function');
          });

          test('should create, after property wiring, a new Reducer assignable to the parent, by passing a reducer function', () => {
            const proxy = forger.override(myOriginalDesc);
            let myNewDesc: Reducer<(value: string) => string> = container.myDesc = proxy
              .reducer(() => (value: string) => value);
            assembler.wire();
            myNewDesc = container.myDesc;
            expect(isDescriptor(myNewDesc)).toBe(true);
            expect(myNewDesc.type).toBe(DescriptorType.reducer);
            expect(myNewDesc).not.toBe(myOriginalDesc);
          });

          test('should provide access to the parent reducer', () => {
            const proxy = forger.override(myOriginalDesc);
            container.myDesc = proxy.reducer(({ parent }) => (value: string) => parent(`${value}2`));
            assembler.wire();
            const result = container.myDesc[jSymbols.payload]()('abc');
            expect(result).toBe('ABC2');
          });

          test('should return a Reducer if the parent is public', () => {
            const proxy = forger.override(myOriginalDesc);
            let myNewDesc = container.myDesc = proxy.reducer(() => (value: string) => value);
            assembler.wire();
            myNewDesc = container.myDesc;
            expect(myOriginalDesc.access).toBe(AccessModifier.public);
            expect(myNewDesc.access).toBe(AccessModifier.public);
          });

          test('should return a PrivateReducer if the parent is private', () => {
            let myOriginalPrivateDesc: PrivateReducer<(value: string) => string> = container.myPrivateReducer = forger
              .private.reducer(() => (value: string) => value.toUpperCase());
            assembler.wire();
            myOriginalPrivateDesc = container.myPrivateReducer;

            const proxy = forger.override(myOriginalPrivateDesc);
            let myNewPrivateDesc: PrivateReducer<(value: string) => string> = container.myPrivateReducer = proxy
              .reducer(() => (value: string) => value);
            assembler.wire();
            myNewPrivateDesc = container.myPrivateReducer;
            expect(myOriginalPrivateDesc.access).toBe(AccessModifier.private);
            expect(myNewPrivateDesc.access).toBe(AccessModifier.private);
          });

          test('should throw error during wire if the parent is not a Reducer', () => {
            container.myDesc = assembler.registerStaticProperty(createSchema(() => new JunctureSchema('')));
            const proxy = forger.override(myOriginalDesc);
            container.myDesc = proxy.reducer(() => () => '');
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });
    });
  });
});
