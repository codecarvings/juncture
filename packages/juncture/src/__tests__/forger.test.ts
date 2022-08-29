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
import { PrivateReactor, Reactor } from '../design/descriptors/reactor';
import { createSchema, Schema } from '../design/descriptors/schema';
import { PrivateSelector, Selector } from '../design/descriptors/selector';
import { PrivateSynthReactor, SynthReactor } from '../design/descriptors/synth-reactor';
import { JunctureSchema } from '../design/schema';
import { Driver } from '../driver';
import { Forger, PrivateForger } from '../forger';
import { Instruction } from '../operation/instruction';
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

    describe('synthReactor', () => {
      test('should be a method', () => {
        expect(typeof forger.synthReactor).toBe('function');
      });

      test('should create, after property wiring, a PrivateSynthReactor, by passing a reactor function', () => {
        container.myDesc = forger.synthReactor(() => () => []);
        assembler.wire();
        expect(isDescriptor(container.myDesc)).toBe(true);
        expect(container.myDesc.type).toBe(DescriptorType.synthReactor);
        expect(container.myDesc.access).toBe(AccessModifier.private);
      });
    });

    describe('reactor', () => {
      test('should be a method', () => {
        expect(typeof forger.reactor).toBe('function');
      });

      test('should create, after property wiring, a PrivateReactor, by passing a reactor function', () => {
        container.myDesc = forger.reactor(({ value }) => () => value());
        assembler.wire();
        expect(isDescriptor(container.myDesc)).toBe(true);
        expect(container.myDesc.type).toBe(DescriptorType.reactor);
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

    describe('synthReactor', () => {
      test('should be a method', () => {
        expect(typeof forger.synthReactor).toBe('function');
      });

      test('should create, after property wiring, a SynthReactor, by passing a reactor function', () => {
        container.myDesc = forger.synthReactor(() => () => []);
        assembler.wire();
        expect(isDescriptor(container.myDesc)).toBe(true);
        expect(container.myDesc.type).toBe(DescriptorType.synthReactor);
        expect(container.myDesc.access).toBe(AccessModifier.public);
      });
    });

    describe('reactor', () => {
      test('should be a method', () => {
        expect(typeof forger.reactor).toBe('function');
      });

      test('should create, after property wiring, a Reactor, by passing a reactor function', () => {
        container.myDesc = forger.reactor(({ value }) => () => value());
        assembler.wire();
        expect(isDescriptor(container.myDesc)).toBe(true);
        expect(container.myDesc.type).toBe(DescriptorType.reactor);
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

      describe('when passing a SynthReactor as type argument, proxy should provide access to', () => {
        let myOriginalDesc: SynthReactor<(value: string) => Instruction[]>;
        beforeEach(() => {
          myOriginalDesc = container.myDesc = forger.synthReactor(() => (value: string) => [{
            target: null!,
            key: 'dummy',
            payload: [value]
          }]);
          assembler.wire();
          myOriginalDesc = container.myDesc;
        });

        describe('a "synthReactor" property that', () => {
          test('should be a method', () => {
            const proxy = forger.override(myOriginalDesc);
            expect(typeof proxy.synthReactor).toBe('function');
          });

          test('should create, after property wiring, a new SynthReactor assignable to the parent, by passing a reactor function', () => {
            const proxy = forger.override(myOriginalDesc);
            let myNewDesc: SynthReactor<(value: string) => Instruction[]> = container.myDesc = proxy
              .synthReactor(() => () => []);
            assembler.wire();
            myNewDesc = container.myDesc;
            expect(isDescriptor(myNewDesc)).toBe(true);
            expect(myNewDesc.type).toBe(DescriptorType.synthReactor);
            expect(myNewDesc).not.toBe(myOriginalDesc);
          });

          test('should provide access to the parent synthReactor', () => {
            const proxy = forger.override(myOriginalDesc);
            container.myDesc = proxy.synthReactor(({ parent }) => (value: string) => parent(`${value}2`));
            assembler.wire();
            const result = container.myDesc[jSymbols.payload]()('abc');
            expect(result).toEqual([{
              target: null,
              key: 'dummy',
              payload: ['abc2']
            }]);
          });

          test('should return a SynthReactor if the parent is public', () => {
            const proxy = forger.override(myOriginalDesc);
            let myNewDesc = container.myDesc = proxy.synthReactor(() => () => []);
            assembler.wire();
            myNewDesc = container.myDesc;
            expect(myOriginalDesc.access).toBe(AccessModifier.public);
            expect(myNewDesc.access).toBe(AccessModifier.public);
          });

          test('should return a PrivateReactor if the parent is private', () => {
            let myOriginalPrivateDesc: PrivateSynthReactor<(value: string) => Instruction[]> = container.myPrivateDesc = forger
              .private.synthReactor(() => (value: string) => [{
                target: null!,
                key: 'dummy',
                payload: [value]
              }]);
            assembler.wire();
            myOriginalPrivateDesc = container.myPrivateDesc;

            const proxy = forger.override(myOriginalPrivateDesc);
            let myNewPrivateDesc: PrivateSynthReactor<(value: string) => Instruction[]> = container.myPrivateDesc = proxy
              .synthReactor(() => () => []);
            assembler.wire();
            myNewPrivateDesc = container.myPrivateDesc;
            expect(myOriginalPrivateDesc.access).toBe(AccessModifier.private);
            expect(myNewPrivateDesc.access).toBe(AccessModifier.private);
          });

          test('should throw error during wire if the parent is not a SynthReactor', () => {
            container.myDesc = assembler.registerStaticProperty(createSchema(() => new JunctureSchema('')));
            const proxy = forger.override(myOriginalDesc);
            container.myDesc = proxy.synthReactor(() => () => []);
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });

      describe('when passing a Reactor as type argument, proxy should provide access to', () => {
        let myOriginalDesc: Reactor<(value: string) => string>;
        beforeEach(() => {
          myOriginalDesc = container.myDesc = forger.reactor(() => (value: string) => value.toUpperCase());
          assembler.wire();
          myOriginalDesc = container.myDesc;
        });

        describe('a "reactor" property that', () => {
          test('should be a method', () => {
            const proxy = forger.override(myOriginalDesc);
            expect(typeof proxy.reactor).toBe('function');
          });

          test('should create, after property wiring, a new Reactor assignable to the parent, by passing a reactor function', () => {
            const proxy = forger.override(myOriginalDesc);
            let myNewDesc: Reactor<(value: string) => string> = container.myDesc = proxy
              .reactor(() => (value: string) => value);
            assembler.wire();
            myNewDesc = container.myDesc;
            expect(isDescriptor(myNewDesc)).toBe(true);
            expect(myNewDesc.type).toBe(DescriptorType.reactor);
            expect(myNewDesc).not.toBe(myOriginalDesc);
          });

          test('should provide access to the parent reactor', () => {
            const proxy = forger.override(myOriginalDesc);
            container.myDesc = proxy.reactor(({ parent }) => (value: string) => parent(`${value}2`));
            assembler.wire();
            const result = container.myDesc[jSymbols.payload]()('abc');
            expect(result).toBe('ABC2');
          });

          test('should return a Reactor if the parent is public', () => {
            const proxy = forger.override(myOriginalDesc);
            let myNewDesc = container.myDesc = proxy.reactor(() => (value: string) => value);
            assembler.wire();
            myNewDesc = container.myDesc;
            expect(myOriginalDesc.access).toBe(AccessModifier.public);
            expect(myNewDesc.access).toBe(AccessModifier.public);
          });

          test('should return a PrivateReactor if the parent is private', () => {
            let myOriginalPrivateDesc: PrivateReactor<(value: string) => string> = container.myPrivateReactor = forger
              .private.reactor(() => (value: string) => value.toUpperCase());
            assembler.wire();
            myOriginalPrivateDesc = container.myPrivateReactor;

            const proxy = forger.override(myOriginalPrivateDesc);
            let myNewPrivateDesc: PrivateReactor<(value: string) => string> = container.myPrivateReactor = proxy
              .reactor(() => (value: string) => value);
            assembler.wire();
            myNewPrivateDesc = container.myPrivateReactor;
            expect(myOriginalPrivateDesc.access).toBe(AccessModifier.private);
            expect(myNewPrivateDesc.access).toBe(AccessModifier.private);
          });

          test('should throw error during wire if the parent is not a Reactor', () => {
            container.myDesc = assembler.registerStaticProperty(createSchema(() => new JunctureSchema('')));
            const proxy = forger.override(myOriginalDesc);
            container.myDesc = proxy.reactor(() => () => '');
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });
    });
  });
});
