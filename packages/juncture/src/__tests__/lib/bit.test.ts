/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-multi-assign */
/* eslint-disable max-len */

import { isDescriptor } from '../../design/descriptor';
import { DescriptorType } from '../../design/descriptor-type';
import {
  createSchema, Schema
} from '../../design/descriptors/schema';
import { createSelector } from '../../design/descriptors/selector';
import { ForgeableDriver } from '../../forgeable-driver';
import { Juncture } from '../../juncture';
import { junctureSymbols } from '../../juncture-symbols';
import {
  BIT,
  BitDriver, BitForger, BitSchema, SettableBitDriver,
  SettableBooleanBitDriver, SettableNumberBitDriver, SettableStringBitDriver, SettableSymbolBitDriver
} from '../../lib/bit';
import { JunctureSchema } from '../../schema';
import { PropertyAssembler } from '../../utilities/property-assembler';

// Exposes constructor as public
export class TestBitSchema<V> extends BitSchema<V> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(defaultValue: V) {
    super(defaultValue);
  }
}

describe('BitSchema', () => {
  test('should be a subclass of Schema', () => {
    expect(BitSchema.prototype).toBeInstanceOf(JunctureSchema);
  });

  test('should be a class instantiable by passing any type of defaultValue', () => {
    expect(typeof new TestBitSchema('')).toBe('object');
    expect(typeof new TestBitSchema(1)).toBe('object');
    expect(typeof new TestBitSchema(true)).toBe('object');
    expect(typeof new TestBitSchema({ myValue: 1 })).toBe('object');
    expect(typeof new TestBitSchema(undefined)).toBe('object');
    expect(typeof new TestBitSchema(null)).toBe('object');
  });
});

describe('BitForger', () => {
  class MyBit extends BitDriver {
    schema = createSchema(() => new JunctureSchema({
      firstName: ''
    }));
  }

  describe('instance', () => {
    let container: any;
    let assembler: PropertyAssembler;
    let forger: BitForger<MyBit>;
    beforeEach(() => {
      container = { };
      assembler = new PropertyAssembler(container);
      forger = new BitForger<MyBit>(assembler);
    });

    describe('override', () => {
      describe('when passing a BitSchema as type argument, proxy should provide access to', () => {
        let myOriginalSchema: Schema<BitSchema<{
          firstName: string;
        }>>;
        beforeEach(() => {
          myOriginalSchema = container.mySchema = assembler.registerStaticProperty(createSchema(() => new TestBitSchema({
            firstName: 'Sergio'
          })));
          assembler.wire();
          myOriginalSchema = container.mySchema;
        });

        describe('a "setDefaultValue" property that', () => {
          test('should be a method', () => {
            const proxy = forger.override(myOriginalSchema);
            expect(typeof proxy.setDefaultValue).toBe('function');
          });

          test('should create, after property wiring, a new Schema of BitSchema assignable to the parent, by passing a schema factory', () => {
            const proxy = forger.override(myOriginalSchema);
            let myNewSchema: Schema<BitSchema<{
              firstName: string
            }>> = container.mySchema = proxy.setDefaultValue(() => ({
              firstName: 'Diego'
            }));
            assembler.wire();
            myNewSchema = container.mySchema;
            expect(isDescriptor(myNewSchema)).toBe(true);
            expect(myNewSchema.type).toBe(DescriptorType.schema);
            expect(myNewSchema).not.toBe(myOriginalSchema);
          });

          test('should not change the type of the schema value', () => {
            const proxy = forger.override(myOriginalSchema);
            let myNewSchema = proxy.setDefaultValue(() => ({
              firstName: 'Fuffo',
              lastName: 'Fufazzi'
            }));

            myOriginalSchema = myNewSchema;
            myNewSchema = myOriginalSchema;
          });

          test('should provide access to the parent schema', () => {
            const proxy = forger.override(myOriginalSchema);
            container.mySchema = proxy.setDefaultValue(({ parent }) => ({
              firstName: `${parent.defaultValue.firstName}2`
            }));
            assembler.wire();
            const result: BitSchema<{ firstName: string }> = container.mySchema[junctureSymbols.payload]();
            expect(result.defaultValue).toEqual({
              firstName: 'Sergio2'
            });
          });

          test('should throw error during wire if the parent is not a Schema', () => {
            container.mySchema = assembler.registerStaticProperty(createSelector(() => undefined));
            const proxy = forger.override(myOriginalSchema);
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
  test('should be a subclass of ForgeableDriver', () => {
    expect(BitDriver.prototype).toBeInstanceOf(ForgeableDriver);
  });

  test('should be a class instantiable without arguments', () => {
    class MyBit extends BitDriver {
      schema = createSchema(() => new TestBitSchema(undefined));
    }
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const driver = new MyBit();
    }).not.toThrow();
  });

  test('should have BitForger as forger', () => {
    class MyBit extends BitDriver {
      schema = createSchema(() => new TestBitSchema(undefined));
    }
    const driver = Juncture.getDriver(MyBit);
    expect((driver as any).FORGE).toBeInstanceOf(BitForger);
  });
});

describe('SettableBit', () => {
  test('should be a subclass of Bit', () => {
    expect(SettableBitDriver.prototype).toBeInstanceOf(BitDriver);
  });

  describe('applicable', () => {
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
    expect(SettableStringBitDriver.prototype).toBeInstanceOf(SettableBitDriver);
  });
});

describe('SettableNumberBit', () => {
  test('should be a subclass of SettableBit', () => {
    expect(SettableNumberBitDriver.prototype).toBeInstanceOf(SettableBitDriver);
  });

  describe('applicable', () => {
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
    expect(SettableBooleanBitDriver.prototype).toBeInstanceOf(SettableBitDriver);
  });

  describe('applicable', () => {
    describe('switch', () => {
      // TODO: Implement this
    });
  });
});

describe('SettableSymbolBit', () => {
  test('should be a subclass of SettableBit', () => {
    expect(SettableSymbolBitDriver.prototype).toBeInstanceOf(SettableBitDriver);
  });
});

describe('BIT - Bit Builder', () => {
  test('should be an object', () => {
    expect(typeof BIT).toBe('object');
  });

  describe('String', () => {
    test('should return a subclass of Bit', () => {
      expect(BIT.string.prototype).toBeInstanceOf(BitDriver);
    });

    test('should always return the same Juncture', () => {
      const s1 = BIT.string;
      const s2 = BIT.string;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value ""', () => {
      const schema = Juncture.getSchema(BIT.string);
      expect(schema.defaultValue).toBe('');
    });
  });

  describe('Number', () => {
    test('should return a subclass of Bit', () => {
      expect(BIT.number.prototype).toBeInstanceOf(BitDriver);
    });

    test('should always return the same Juncture', () => {
      const s1 = BIT.number;
      const s2 = BIT.number;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value 0', () => {
      const schema = Juncture.getSchema(BIT.number);
      expect(schema.defaultValue).toBe(0);
    });
  });

  describe('Boolean', () => {
    test('should return a subclass of Bit', () => {
      expect(BIT.boolean.prototype).toBeInstanceOf(BitDriver);
    });

    test('should always return the same Juncture', () => {
      const s1 = BIT.boolean;
      const s2 = BIT.boolean;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value false', () => {
      const schema = Juncture.getSchema(BIT.boolean);
      expect(schema.defaultValue).toBe(false);
    });
  });

  describe('Symbol', () => {
    test('should return a subclass of Bit', () => {
      expect(BIT.symbol.prototype).toBeInstanceOf(BitDriver);
    });

    test('should always return the same Juncture', () => {
      const s1 = BIT.symbol;
      const s2 = BIT.symbol;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value jSymbols.bitDefault', () => {
      const schema = Juncture.getSchema(BIT.symbol);
      expect(schema.defaultValue).toBe(junctureSymbols.bitDefault);
    });
  });

  describe('of', () => {
    test('should be a method', () => {
      expect(typeof BIT.of).toBe('function');
    });

    describe('when passing an empty string as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(BIT.of('').prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = BIT.of('');
        const s2 = BIT.of('');
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value ""', () => {
        const schema = Juncture.getSchema(BIT.of(''));
        expect(schema.defaultValue).toBe('');
      });
    });

    describe('when passing a non-empty string as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(BIT.of('').prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = 'a';
        const s1 = BIT.of(defaultValue);
        const s2 = BIT.of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = 'X';
        const schema = Juncture.getSchema(BIT.of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing the number zero as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(BIT.of(0).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = BIT.of(0);
        const s2 = BIT.of(0);
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value 0', () => {
        const schema = Juncture.getSchema(BIT.of(0));
        expect(schema.defaultValue).toBe(0);
      });
    });

    describe('when passing a non-zero number as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(BIT.of(1).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = 1;
        const s1 = BIT.of(defaultValue);
        const s2 = BIT.of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = 2;
        const schema = Juncture.getSchema(BIT.of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing the boolean value "false" as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(BIT.of(false).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = BIT.of(false);
        const s2 = BIT.of(false);
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value "false"', () => {
        const schema = Juncture.getSchema(BIT.of(false));
        expect(schema.defaultValue).toBe(false);
      });
    });

    describe('when passing the boolean value "true" as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(BIT.of(true).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = true;
        const s1 = BIT.of(defaultValue);
        const s2 = BIT.of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = true;
        const schema = Juncture.getSchema(BIT.of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing the symbol jSymbols.bitDefault as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(BIT.of(junctureSymbols.bitDefault).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = BIT.of(junctureSymbols.bitDefault);
        const s2 = BIT.of(junctureSymbols.bitDefault);
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value jSymbols.bitDefault', () => {
        const schema = Juncture.getSchema(BIT.of(junctureSymbols.bitDefault));
        expect(schema.defaultValue).toBe(junctureSymbols.bitDefault);
      });
    });

    describe('when passing a symbol different from jSymbols.bitDefault as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(BIT.of(Symbol('test')).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = Symbol('test');
        const s1 = BIT.of(defaultValue);
        const s2 = BIT.of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = Symbol('test');
        const schema = Juncture.getSchema(BIT.of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing an object as argument', () => {
      test('should return a subclass of Bit', () => {
        expect(BIT.of({ myValue: 1 }).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = { myValue: 1 };
        const s1 = BIT.of(defaultValue);
        const s2 = BIT.of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = { myValue: 1 };
        const schema = Juncture.getSchema(BIT.of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing null as argument', () => {
      test('should return a subclass of Bit', () => {
        expect(BIT.of(null).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = null;
        const s1 = BIT.of(defaultValue);
        const s2 = BIT.of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set to null', () => {
        const defaultValue = null;
        const schema = Juncture.getSchema(BIT.of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing undefined as argument', () => {
      test('should return a subclass of Bit', () => {
        expect(BIT.of(undefined).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = undefined;
        const s1 = BIT.of(defaultValue);
        const s2 = BIT.of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set to undefined', () => {
        const defaultValue = undefined;
        const schema = Juncture.getSchema(BIT.of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });
  });

  describe('settable', () => {
    test('should be an object', () => {
      expect(typeof BIT.settable).toBe('object');
    });

    describe('String', () => {
      test('should return a subclass of SettableStringBit', () => {
        expect(BIT.settable.string.prototype).toBeInstanceOf(SettableStringBitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = BIT.settable.string;
        const s2 = BIT.settable.string;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value ""', () => {
        const schema = Juncture.getSchema(BIT.settable.string);
        expect(schema.defaultValue).toBe('');
      });
    });

    describe('Number', () => {
      test('should return a subclass of SettableNumberBit', () => {
        expect(BIT.settable.number.prototype).toBeInstanceOf(SettableNumberBitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = BIT.settable.number;
        const s2 = BIT.settable.number;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value 0', () => {
        const schema = Juncture.getSchema(BIT.settable.number);
        expect(schema.defaultValue).toBe(0);
      });
    });

    describe('Boolean', () => {
      test('should return a subclass of SettableBooleanBit', () => {
        expect(BIT.settable.boolean.prototype).toBeInstanceOf(SettableBooleanBitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = BIT.settable.boolean;
        const s2 = BIT.settable.boolean;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value false', () => {
        const schema = Juncture.getSchema(BIT.settable.boolean);
        expect(schema.defaultValue).toBe(false);
      });
    });

    describe('Symbol', () => {
      test('should return a subclass of SettableSymbolBit', () => {
        expect(BIT.settable.symbol.prototype).toBeInstanceOf(SettableSymbolBitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = BIT.settable.symbol;
        const s2 = BIT.settable.symbol;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value jSymbols.bitDefault', () => {
        const schema = Juncture.getSchema(BIT.settable.symbol);
        expect(schema.defaultValue).toBe(junctureSymbols.bitDefault);
      });
    });

    describe('of', () => {
      test('should be a method', () => {
        expect(typeof BIT.settable.of).toBe('function');
      });

      describe('when passing an empty string as paramter', () => {
        test('should return a subclass of SettableStringBit', () => {
          expect(BIT.settable.of('').prototype).toBeInstanceOf(SettableStringBitDriver);
        });

        test('should always return the same Juncture', () => {
          const s1 = BIT.settable.of('');
          const s2 = BIT.settable.of('');
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value ""', () => {
          const schema = Juncture.getSchema(BIT.settable.of(''));
          expect(schema.defaultValue).toBe('');
        });
      });

      describe('when passing a non-empty string as paramter', () => {
        test('should return a subclass of SettableStringBit', () => {
          expect(BIT.settable.of('').prototype).toBeInstanceOf(SettableStringBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = 'a';
          const s1 = BIT.settable.of(defaultValue);
          const s2 = BIT.settable.of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = 'X';
          const schema = Juncture.getSchema(BIT.settable.of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing the number zero as paramter', () => {
        test('should return a subclass of SettableNumberBit', () => {
          expect(BIT.settable.of(0).prototype).toBeInstanceOf(SettableNumberBitDriver);
        });

        test('should always return the same Juncture', () => {
          const s1 = BIT.settable.of(0);
          const s2 = BIT.settable.of(0);
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value 0', () => {
          const schema = Juncture.getSchema(BIT.settable.of(0));
          expect(schema.defaultValue).toBe(0);
        });
      });

      describe('when passing a non-zero number as paramter', () => {
        test('should return a subclass of SettableNumberBit', () => {
          expect(BIT.settable.of(1).prototype).toBeInstanceOf(SettableNumberBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = 1;
          const s1 = BIT.settable.of(defaultValue);
          const s2 = BIT.settable.of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = 2;
          const schema = Juncture.getSchema(BIT.settable.of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing the boolean value "false" as paramter', () => {
        test('should return a subclass of SettableBooleanBit', () => {
          expect(BIT.settable.of(false).prototype).toBeInstanceOf(SettableBooleanBitDriver);
        });

        test('should always return the same Juncture', () => {
          const s1 = BIT.settable.of(false);
          const s2 = BIT.settable.of(false);
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value "false"', () => {
          const schema = Juncture.getSchema(BIT.settable.of(false));
          expect(schema.defaultValue).toBe(false);
        });
      });

      describe('when passing the boolean value "true" as paramter', () => {
        test('should return a subclass of SettableBooleanBit', () => {
          expect(BIT.settable.of(true).prototype).toBeInstanceOf(SettableBooleanBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = true;
          const s1 = BIT.settable.of(defaultValue);
          const s2 = BIT.settable.of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = true;
          const schema = Juncture.getSchema(BIT.settable.of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing the symbol jSymbols.bitDefault as paramter', () => {
        test('should return a subclass of SettableSymbolBit', () => {
          expect(BIT.settable.of(junctureSymbols.bitDefault).prototype).toBeInstanceOf(SettableSymbolBitDriver);
        });

        test('should always return the same Juncture', () => {
          const s1 = BIT.settable.of(junctureSymbols.bitDefault);
          const s2 = BIT.settable.of(junctureSymbols.bitDefault);
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value jSymbols.bitDefault', () => {
          const schema = Juncture.getSchema(BIT.settable.of(junctureSymbols.bitDefault));
          expect(schema.defaultValue).toBe(junctureSymbols.bitDefault);
        });
      });

      describe('when passing a symbol different from jSymbols.bitDefault as paramter', () => {
        test('should return a subclass of SettableSymbolBit', () => {
          expect(BIT.settable.of(Symbol('test')).prototype).toBeInstanceOf(SettableSymbolBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = Symbol('test');
          const s1 = BIT.settable.of(defaultValue);
          const s2 = BIT.settable.of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = Symbol('test');
          const schema = Juncture.getSchema(BIT.settable.of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing an object as argument', () => {
        test('should return a subclass of SettableBit', () => {
          expect(BIT.settable.of({ myValue: 1 }).prototype).toBeInstanceOf(SettableBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = { myValue: 1 };
          const s1 = BIT.settable.of(defaultValue);
          const s2 = BIT.settable.of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = { myValue: 1 };
          const schema = Juncture.getSchema(BIT.settable.of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing null as argument', () => {
        test('should return a subclass of SettableBit', () => {
          expect(BIT.settable.of(null).prototype).toBeInstanceOf(SettableBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = null;
          const s1 = BIT.settable.of(defaultValue);
          const s2 = BIT.settable.of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set to null', () => {
          const defaultValue = null;
          const schema = Juncture.getSchema(BIT.settable.of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing undefined as argument', () => {
        test('should return a subclass of SettableBit', () => {
          expect(BIT.settable.of(undefined).prototype).toBeInstanceOf(SettableBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = undefined;
          const s1 = BIT.settable.of(defaultValue);
          const s2 = BIT.settable.of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set to undefined', () => {
          const defaultValue = undefined;
          const schema = Juncture.getSchema(BIT.settable.of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });
    });
  });
});
