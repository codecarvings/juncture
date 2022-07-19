/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-multi-assign */
/* eslint-disable max-len */

import { asPrivate, isPrivate, Private } from '../../definition/private';
import { PropertyAssembler } from '../../definition/property-assembler';
import {
  createSchemaDef, isSchemaDef, Schema, SchemaDef
} from '../../definition/schema';
import { createDirectSelectorDef } from '../../definition/selector';
import { Juncture } from '../../juncture';
import {
  Bit, BitDefComposer, BitSchema, jBit, SettableBit,
  SettableBooleanBit, SettableNumberBit, SettableStringBit, SettableSymbolBit
} from '../../lib/bit';
import { jSymbols } from '../../symbols';

// Exposes constructor as public
export class TestBitSchema<V> extends BitSchema<V> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(defaultValue: V) {
    super(defaultValue);
  }
}

describe('BitSchema', () => {
  test('should be a subclass of Schema', () => {
    expect(BitSchema.prototype).toBeInstanceOf(Schema);
  });

  test('should be a class instantiable by passing any type of defaultValue', () => {
    expect(typeof new TestBitSchema('')).toBe('object');
    expect(typeof new TestBitSchema(1)).toBe('object');
    expect(typeof new TestBitSchema(true)).toBe('object');
    expect(typeof new TestBitSchema({ myValue: 1 })).toBe('object');
    expect(typeof new TestBitSchema(undefined)).toBe('object');
    expect(typeof new TestBitSchema(null)).toBe('object');
  });

  test('should have a "defaultProperty" contianing the same value passed to the constructor', () => {
    const defaultValue = { myValue: 1 };
    const schema = new TestBitSchema(defaultValue);
    expect(schema.defaultValue).toBe(defaultValue);
  });
});

describe('BitDefComposer', () => {
  class MyBit extends Bit {
    schema = createSchemaDef(() => new Schema({
      firstName: ''
    }));
  }

  describe('instance', () => {
    let juncture: MyBit;
    let container: any;
    let assembler: PropertyAssembler;
    let composer: BitDefComposer<MyBit>;
    beforeEach(() => {
      juncture = new MyBit();
      container = juncture;
      assembler = Juncture.getPropertyAssembler(juncture);
      composer = new BitDefComposer(juncture);
    });

    describe('override', () => {
      describe('when passing a BitSchemaDef as type argument, proxy should provide access to', () => {
        let myOriginalSchema: SchemaDef<BitSchema<{
          firstName: string;
        }>>;
        beforeEach(() => {
          myOriginalSchema = container.mySchema = assembler.registerStaticProperty(createSchemaDef(() => new TestBitSchema({
            firstName: 'Sergio'
          })));
          assembler.wire();
          myOriginalSchema = container.mySchema;
        });

        describe('a "setDefaultValue" property that', () => {
          test('should be a function', () => {
            const proxy = composer.override(myOriginalSchema);
            expect(typeof proxy.setDefaultValue).toBe('function');
          });

          test('should create, after property wiring, a new SchemaDef of BitSchema assignable to the parent, by passing a schema factory', () => {
            const proxy = composer.override(myOriginalSchema);
            let myNewSchema: SchemaDef<BitSchema<{
              firstName: string
            }>> = container.mySchema = proxy.setDefaultValue(() => ({
              firstName: 'Diego'
            }));
            assembler.wire();
            myNewSchema = container.mySchema;
            expect(isSchemaDef(myNewSchema)).toBe(true);
            expect(myNewSchema).not.toBe(myOriginalSchema);
          });

          test('should not change the type of the schema value', () => {
            const proxy = composer.override(myOriginalSchema);
            let myNewSchema = proxy.setDefaultValue(() => ({
              firstName: 'Fuffo',
              lastName: 'Fufazzi'
            }));

            myOriginalSchema = myNewSchema;
            myNewSchema = myOriginalSchema;
          });

          test('should provide access to the parent schema', () => {
            const proxy = composer.override(myOriginalSchema);
            container.mySchema = proxy.setDefaultValue(({ parent }) => ({
              firstName: `${parent.defaultValue.firstName}2`
            }));
            assembler.wire();
            const result: BitSchema<{ firstName: string }> = container.mySchema[jSymbols.defPayload]();
            expect(result.defaultValue).toEqual({
              firstName: 'Sergio2'
            });
          });

          test('should return a non-private SchemaDef if the parent is not private', () => {
            const proxy = composer.override(myOriginalSchema);
            let myNewSchema = container.mySchema = proxy.setDefaultValue(() => ({ firstName: 'test' }));
            assembler.wire();
            myNewSchema = container.mySchema;
            expect(isPrivate(myOriginalSchema)).toBe(false);
            expect(isSchemaDef(myNewSchema)).toBe(true);
            expect(isPrivate(myNewSchema)).toBe(false);
          });

          test('should return a private SchemaDef if the parent is private', () => {
            let myOriginalPrivateSchema: Private<SchemaDef<BitSchema<{
              firstName: string
            }>>> = container.myPrivateSchema = assembler.registerStaticProperty(asPrivate(createSchemaDef(() => new TestBitSchema({
              firstName: 'Sergio'
            }))));
            assembler.wire();
            myOriginalPrivateSchema = container.myPrivateSchema;

            const proxy = composer.override(myOriginalPrivateSchema);
            let myNewPrivateSchema: Private<SchemaDef<BitSchema<{
              firstName: string
            }>>> = container.myPrivateSchema = proxy.setDefaultValue(() => ({ firstName: 'test' }));
            assembler.wire();
            myNewPrivateSchema = container.myPrivateSchema;
            expect(isPrivate(myOriginalPrivateSchema)).toBe(true);
            expect(isSchemaDef(myNewPrivateSchema)).toBe(true);
            expect(isPrivate(myNewPrivateSchema)).toBe(true);
          });

          test('should throw error during wire if the parent is not a SchemaDef', () => {
            container.mySchema = assembler.registerStaticProperty(createDirectSelectorDef(() => undefined));
            const proxy = composer.override(myOriginalSchema);
            container.mySchema = proxy.setDefaultValue(() => ({
              firstName: 'test'
            }));
            expect(() => {
              assembler.wire();
            }).toThrow();
          });
        });
      });
    });
  });
});

describe('Bit', () => {
  test('should be a subclass of Juncture', () => {
    expect(jBit.String.prototype).toBeInstanceOf(Juncture);
  });

  test('should have BitDefComposer as composer', () => {
    class MyBit extends Bit {
      schema = createSchemaDef(() => new TestBitSchema(undefined));
    }
    const myBit = Juncture.getInstance(MyBit);
    expect((myBit as any).DEF).toBeInstanceOf(BitDefComposer);
  });
});

describe('SettableBit', () => {
  test('should be a subclass of Bit', () => {
    expect(SettableBit.prototype).toBeInstanceOf(Bit);
  });

  describe('reducers', () => {
    describe('reset', () => {
      // TODO: Implement this
    });
    describe('set', () => {
      // TODO: Implement this
    });
  });
});

describe('SettableStringBit', () => {
  test('should be a subclass of SettableBit', () => {
    expect(SettableStringBit.prototype).toBeInstanceOf(SettableBit);
  });
});

describe('SettableNumberBit', () => {
  test('should be a subclass of SettableBit', () => {
    expect(SettableNumberBit.prototype).toBeInstanceOf(SettableBit);
  });

  describe('reducers', () => {
    describe('add', () => {
      // TODO: Implement this
    });
    describe('inc', () => {
      // TODO: Implement this
    });
    describe('desc', () => {
      // TODO: Implement this
    });
  });
});

describe('SettableBooleanBit', () => {
  test('should be a subclass of SettableBit', () => {
    expect(SettableBooleanBit.prototype).toBeInstanceOf(SettableBit);
  });

  describe('reducers', () => {
    describe('switch', () => {
      // TODO: Implement this
    });
  });
});

describe('SettableSymbolBit', () => {
  test('should be a subclass of SettableBit', () => {
    expect(SettableSymbolBit.prototype).toBeInstanceOf(SettableBit);
  });
});

describe('jBit - Bit Builder', () => {
  test('should be an object', () => {
    expect(typeof jBit).toBe('object');
  });

  describe('String', () => {
    test('should return a subclass of Bit', () => {
      expect(jBit.String.prototype).toBeInstanceOf(Bit);
    });

    test('should always return the same Juncture', () => {
      const s1 = jBit.String;
      const s2 = jBit.String;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value ""', () => {
      const instance = Juncture.getInstance(jBit.String);
      const driver = Juncture.getDriver(instance);
      expect(driver.schema.defaultValue).toBe('');
    });
  });

  describe('Number', () => {
    test('should return a subclass of Bit', () => {
      expect(jBit.Number.prototype).toBeInstanceOf(Bit);
    });

    test('should always return the same Juncture', () => {
      const s1 = jBit.Number;
      const s2 = jBit.Number;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value 0', () => {
      const instance = Juncture.getInstance(jBit.Number);
      const driver = Juncture.getDriver(instance);
      expect(driver.schema.defaultValue).toBe(0);
    });
  });

  describe('Boolean', () => {
    test('should return a subclass of Bit', () => {
      expect(jBit.Boolean.prototype).toBeInstanceOf(Bit);
    });

    test('should always return the same Juncture', () => {
      const s1 = jBit.Boolean;
      const s2 = jBit.Boolean;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value false', () => {
      const instance = Juncture.getInstance(jBit.Boolean);
      const driver = Juncture.getDriver(instance);
      expect(driver.schema.defaultValue).toBe(false);
    });
  });

  describe('Symbol', () => {
    test('should return a subclass of Bit', () => {
      expect(jBit.Symbol.prototype).toBeInstanceOf(Bit);
    });

    test('should always return the same Juncture', () => {
      const s1 = jBit.Symbol;
      const s2 = jBit.Symbol;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value jSymbols.bitDefault', () => {
      const instance = Juncture.getInstance(jBit.Symbol);
      const driver = Juncture.getDriver(instance);
      expect(driver.schema.defaultValue).toBe(jSymbols.bitDefault);
    });
  });

  describe('Of', () => {
    test('should be a function', () => {
      expect(typeof jBit.Of).toBe('function');
    });

    describe('when passing an empty string as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of('').prototype).toBeInstanceOf(Bit);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.Of('');
        const s2 = jBit.Of('');
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value ""', () => {
        const instance = Juncture.getInstance(jBit.Of(''));
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe('');
      });
    });

    describe('when passing a non-empty string as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of('').prototype).toBeInstanceOf(Bit);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = 'a';
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = 'X';
        const instance = Juncture.getInstance(jBit.Of(defaultValue));
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing the number zero as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(0).prototype).toBeInstanceOf(Bit);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.Of(0);
        const s2 = jBit.Of(0);
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value 0', () => {
        const instance = Juncture.getInstance(jBit.Of(0));
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(0);
      });
    });

    describe('when passing a non-zero number as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(1).prototype).toBeInstanceOf(Bit);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = 1;
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = 2;
        const instance = Juncture.getInstance(jBit.Of(defaultValue));
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing the boolean value "false" as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(false).prototype).toBeInstanceOf(Bit);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.Of(false);
        const s2 = jBit.Of(false);
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value "false"', () => {
        const instance = Juncture.getInstance(jBit.Of(false));
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(false);
      });
    });

    describe('when passing the boolean value "true" as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(true).prototype).toBeInstanceOf(Bit);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = true;
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = true;
        const instance = Juncture.getInstance(jBit.Of(defaultValue));
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing the symbol jSymbols.bitDefault as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(jSymbols.bitDefault).prototype).toBeInstanceOf(Bit);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.Of(jSymbols.bitDefault);
        const s2 = jBit.Of(jSymbols.bitDefault);
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value jSymbols.bitDefault', () => {
        const instance = Juncture.getInstance(jBit.Of(jSymbols.bitDefault));
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(jSymbols.bitDefault);
      });
    });

    describe('when passing a symbol different from jSymbols.bitDefault as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(Symbol('test')).prototype).toBeInstanceOf(Bit);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = Symbol('test');
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = Symbol('test');
        const instance = Juncture.getInstance(jBit.Of(defaultValue));
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing an object as parameter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of({ myValue: 1 }).prototype).toBeInstanceOf(Bit);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = { myValue: 1 };
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = { myValue: 1 };
        const instance = Juncture.getInstance(jBit.Of(defaultValue));
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing null as parameter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(null).prototype).toBeInstanceOf(Bit);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = null;
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set to null', () => {
        const defaultValue = null;
        const instance = Juncture.getInstance(jBit.Of(defaultValue));
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing undefined as parameter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(undefined).prototype).toBeInstanceOf(Bit);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = undefined;
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set to undefined', () => {
        const defaultValue = undefined;
        const instance = Juncture.getInstance(jBit.Of(defaultValue));
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(defaultValue);
      });
    });
  });

  describe('settable', () => {
    test('should be an object', () => {
      expect(typeof jBit.settable).toBe('object');
    });

    describe('String', () => {
      test('should return a subclass of SettableStringBit', () => {
        expect(jBit.settable.String.prototype).toBeInstanceOf(SettableStringBit);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.settable.String;
        const s2 = jBit.settable.String;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value ""', () => {
        const instance = Juncture.getInstance(jBit.settable.String);
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe('');
      });
    });

    describe('Number', () => {
      test('should return a subclass of SettableNumberBit', () => {
        expect(jBit.settable.Number.prototype).toBeInstanceOf(SettableNumberBit);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.settable.Number;
        const s2 = jBit.settable.Number;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value 0', () => {
        const instance = Juncture.getInstance(jBit.settable.Number);
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(0);
      });
    });

    describe('Boolean', () => {
      test('should return a subclass of SettableBooleanBit', () => {
        expect(jBit.settable.Boolean.prototype).toBeInstanceOf(SettableBooleanBit);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.settable.Boolean;
        const s2 = jBit.settable.Boolean;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value false', () => {
        const instance = Juncture.getInstance(jBit.settable.Boolean);
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(false);
      });
    });

    describe('Symbol', () => {
      test('should return a subclass of SettableSymbolBit', () => {
        expect(jBit.settable.Symbol.prototype).toBeInstanceOf(SettableSymbolBit);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.settable.Symbol;
        const s2 = jBit.settable.Symbol;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value jSymbols.bitDefault', () => {
        const instance = Juncture.getInstance(jBit.settable.Symbol);
        const driver = Juncture.getDriver(instance);
        expect(driver.schema.defaultValue).toBe(jSymbols.bitDefault);
      });
    });

    describe('Of', () => {
      test('should be a function', () => {
        expect(typeof jBit.settable.Of).toBe('function');
      });

      describe('when passing an empty string as paramter', () => {
        test('should return a subclass of SettableStringBit', () => {
          expect(jBit.settable.Of('').prototype).toBeInstanceOf(SettableStringBit);
        });

        test('should always return the same Juncture', () => {
          const s1 = jBit.settable.Of('');
          const s2 = jBit.settable.Of('');
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value ""', () => {
          const instance = Juncture.getInstance(jBit.settable.Of(''));
          const driver = Juncture.getDriver(instance);
          expect(driver.schema.defaultValue).toBe('');
        });
      });

      describe('when passing a non-empty string as paramter', () => {
        test('should return a subclass of SettableStringBit', () => {
          expect(jBit.settable.Of('').prototype).toBeInstanceOf(SettableStringBit);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = 'a';
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = 'X';
          const instance = Juncture.getInstance(jBit.settable.Of(defaultValue));
          const driver = Juncture.getDriver(instance);
          expect(driver.schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing the number zero as paramter', () => {
        test('should return a subclass of SettableNumberBit', () => {
          expect(jBit.settable.Of(0).prototype).toBeInstanceOf(SettableNumberBit);
        });

        test('should always return the same Juncture', () => {
          const s1 = jBit.settable.Of(0);
          const s2 = jBit.settable.Of(0);
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value 0', () => {
          const instance = Juncture.getInstance(jBit.settable.Of(0));
          const driver = Juncture.getDriver(instance);
          expect(driver.schema.defaultValue).toBe(0);
        });
      });

      describe('when passing a non-zero number as paramter', () => {
        test('should return a subclass of SettableNumberBit', () => {
          expect(jBit.settable.Of(1).prototype).toBeInstanceOf(SettableNumberBit);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = 1;
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = 2;
          const instance = Juncture.getInstance(jBit.settable.Of(defaultValue));
          const driver = Juncture.getDriver(instance);
          expect(driver.schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing the boolean value "false" as paramter', () => {
        test('should return a subclass of SettableBooleanBit', () => {
          expect(jBit.settable.Of(false).prototype).toBeInstanceOf(SettableBooleanBit);
        });

        test('should always return the same Juncture', () => {
          const s1 = jBit.settable.Of(false);
          const s2 = jBit.settable.Of(false);
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value "false"', () => {
          const instance = Juncture.getInstance(jBit.settable.Of(false));
          const driver = Juncture.getDriver(instance);
          expect(driver.schema.defaultValue).toBe(false);
        });
      });

      describe('when passing the boolean value "true" as paramter', () => {
        test('should return a subclass of SettableBooleanBit', () => {
          expect(jBit.settable.Of(true).prototype).toBeInstanceOf(SettableBooleanBit);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = true;
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = true;
          const instance = Juncture.getInstance(jBit.settable.Of(defaultValue));
          const driver = Juncture.getDriver(instance);
          expect(driver.schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing the symbol jSymbols.bitDefault as paramter', () => {
        test('should return a subclass of SettableSymbolBit', () => {
          expect(jBit.settable.Of(jSymbols.bitDefault).prototype).toBeInstanceOf(SettableSymbolBit);
        });

        test('should always return the same Juncture', () => {
          const s1 = jBit.settable.Of(jSymbols.bitDefault);
          const s2 = jBit.settable.Of(jSymbols.bitDefault);
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value jSymbols.bitDefault', () => {
          const instance = Juncture.getInstance(jBit.settable.Of(jSymbols.bitDefault));
          const driver = Juncture.getDriver(instance);
          expect(driver.schema.defaultValue).toBe(jSymbols.bitDefault);
        });
      });

      describe('when passing a symbol different from jSymbols.bitDefault as paramter', () => {
        test('should return a subclass of SettableSymbolBit', () => {
          expect(jBit.settable.Of(Symbol('test')).prototype).toBeInstanceOf(SettableSymbolBit);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = Symbol('test');
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = Symbol('test');
          const instance = Juncture.getInstance(jBit.settable.Of(defaultValue));
          const driver = Juncture.getDriver(instance);
          expect(driver.schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing an object as parameter', () => {
        test('should return a subclass of SettableBit', () => {
          expect(jBit.settable.Of({ myValue: 1 }).prototype).toBeInstanceOf(SettableBit);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = { myValue: 1 };
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = { myValue: 1 };
          const instance = Juncture.getInstance(jBit.settable.Of(defaultValue));
          const driver = Juncture.getDriver(instance);
          expect(driver.schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing null as parameter', () => {
        test('should return a subclass of SettableBit', () => {
          expect(jBit.settable.Of(null).prototype).toBeInstanceOf(SettableBit);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = null;
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set to null', () => {
          const defaultValue = null;
          const instance = Juncture.getInstance(jBit.settable.Of(defaultValue));
          const driver = Juncture.getDriver(instance);
          expect(driver.schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing undefined as parameter', () => {
        test('should return a subclass of SettableBit', () => {
          expect(jBit.settable.Of(undefined).prototype).toBeInstanceOf(SettableBit);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = undefined;
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set to undefined', () => {
          const defaultValue = undefined;
          const instance = Juncture.getInstance(jBit.settable.Of(defaultValue));
          const driver = Juncture.getDriver(instance);
          expect(driver.schema.defaultValue).toBe(defaultValue);
        });
      });
    });
  });
});
