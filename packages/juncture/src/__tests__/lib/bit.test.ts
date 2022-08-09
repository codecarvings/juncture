/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-multi-assign */
/* eslint-disable max-len */

import { DescriptorType, isDescriptor } from '../../construction/descriptor';
import {
  createSchema, Schema
} from '../../construction/descriptors/schema';
import { createSelector } from '../../construction/descriptors/selector';
import { PropertyAssembler } from '../../construction/property-assembler';
import { JunctureSchema } from '../../construction/schema';
import { ForgeableJuncture } from '../../forgeable-juncture';
import { Juncture } from '../../juncture';
import {
  BitForger, BitJuncture, BitSchema, jBit, SettableBitJuncture,
  SettableBooleanBitJuncture, SettableNumberBitJuncture, SettableStringBitJuncture, SettableSymbolBitJuncture
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
  class MyBit extends BitJuncture {
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
            const result: BitSchema<{ firstName: string }> = container.mySchema[jSymbols.payload]();
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
  test('should be a subclass of ForgeableJuncture', () => {
    expect(BitJuncture.prototype).toBeInstanceOf(ForgeableJuncture);
  });

  test('should be a class instantiable without arguments', () => {
    class MyBit extends BitJuncture {
      schema = createSchema(() => new TestBitSchema(undefined));
    }
    const juncture = new MyBit();
    expect(juncture).toBeInstanceOf(Juncture);
  });

  test('should have BitForger as forger', () => {
    class MyBit extends BitJuncture {
      schema = createSchema(() => new TestBitSchema(undefined));
    }
    const juncture = Juncture.getInstance(MyBit);
    expect((juncture as any).FORGE).toBeInstanceOf(BitForger);
  });
});

describe('SettableBit', () => {
  test('should be a subclass of Bit', () => {
    expect(SettableBitJuncture.prototype).toBeInstanceOf(BitJuncture);
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
    expect(SettableStringBitJuncture.prototype).toBeInstanceOf(SettableBitJuncture);
  });
});

describe('SettableNumberBit', () => {
  test('should be a subclass of SettableBit', () => {
    expect(SettableNumberBitJuncture.prototype).toBeInstanceOf(SettableBitJuncture);
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
    expect(SettableBooleanBitJuncture.prototype).toBeInstanceOf(SettableBitJuncture);
  });

  describe('reducers', () => {
    describe('switch', () => {
      // TODO: Implement this
    });
  });
});

describe('SettableSymbolBit', () => {
  test('should be a subclass of SettableBit', () => {
    expect(SettableSymbolBitJuncture.prototype).toBeInstanceOf(SettableBitJuncture);
  });
});

describe('jBit - Bit Builder', () => {
  test('should be an object', () => {
    expect(typeof jBit).toBe('object');
  });

  describe('String', () => {
    test('should return a subclass of Bit', () => {
      expect(jBit.String.prototype).toBeInstanceOf(BitJuncture);
    });

    test('should always return the same Juncture', () => {
      const s1 = jBit.String;
      const s2 = jBit.String;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value ""', () => {
      const schema = Juncture.getSchema(jBit.String);
      expect(schema.defaultValue).toBe('');
    });
  });

  describe('Number', () => {
    test('should return a subclass of Bit', () => {
      expect(jBit.Number.prototype).toBeInstanceOf(BitJuncture);
    });

    test('should always return the same Juncture', () => {
      const s1 = jBit.Number;
      const s2 = jBit.Number;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value 0', () => {
      const schema = Juncture.getSchema(jBit.Number);
      expect(schema.defaultValue).toBe(0);
    });
  });

  describe('Boolean', () => {
    test('should return a subclass of Bit', () => {
      expect(jBit.Boolean.prototype).toBeInstanceOf(BitJuncture);
    });

    test('should always return the same Juncture', () => {
      const s1 = jBit.Boolean;
      const s2 = jBit.Boolean;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value false', () => {
      const schema = Juncture.getSchema(jBit.Boolean);
      expect(schema.defaultValue).toBe(false);
    });
  });

  describe('Symbol', () => {
    test('should return a subclass of Bit', () => {
      expect(jBit.Symbol.prototype).toBeInstanceOf(BitJuncture);
    });

    test('should always return the same Juncture', () => {
      const s1 = jBit.Symbol;
      const s2 = jBit.Symbol;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value jSymbols.bitDefault', () => {
      const schema = Juncture.getSchema(jBit.Symbol);
      expect(schema.defaultValue).toBe(jSymbols.bitDefault);
    });
  });

  describe('Of', () => {
    test('should be a method', () => {
      expect(typeof jBit.Of).toBe('function');
    });

    describe('when passing an empty string as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of('').prototype).toBeInstanceOf(BitJuncture);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.Of('');
        const s2 = jBit.Of('');
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value ""', () => {
        const schema = Juncture.getSchema(jBit.Of(''));
        expect(schema.defaultValue).toBe('');
      });
    });

    describe('when passing a non-empty string as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of('').prototype).toBeInstanceOf(BitJuncture);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = 'a';
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = 'X';
        const schema = Juncture.getSchema(jBit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing the number zero as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(0).prototype).toBeInstanceOf(BitJuncture);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.Of(0);
        const s2 = jBit.Of(0);
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value 0', () => {
        const schema = Juncture.getSchema(jBit.Of(0));
        expect(schema.defaultValue).toBe(0);
      });
    });

    describe('when passing a non-zero number as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(1).prototype).toBeInstanceOf(BitJuncture);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = 1;
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = 2;
        const schema = Juncture.getSchema(jBit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing the boolean value "false" as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(false).prototype).toBeInstanceOf(BitJuncture);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.Of(false);
        const s2 = jBit.Of(false);
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value "false"', () => {
        const schema = Juncture.getSchema(jBit.Of(false));
        expect(schema.defaultValue).toBe(false);
      });
    });

    describe('when passing the boolean value "true" as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(true).prototype).toBeInstanceOf(BitJuncture);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = true;
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = true;
        const schema = Juncture.getSchema(jBit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing the symbol jSymbols.bitDefault as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(jSymbols.bitDefault).prototype).toBeInstanceOf(BitJuncture);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.Of(jSymbols.bitDefault);
        const s2 = jBit.Of(jSymbols.bitDefault);
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value jSymbols.bitDefault', () => {
        const schema = Juncture.getSchema(jBit.Of(jSymbols.bitDefault));
        expect(schema.defaultValue).toBe(jSymbols.bitDefault);
      });
    });

    describe('when passing a symbol different from jSymbols.bitDefault as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(Symbol('test')).prototype).toBeInstanceOf(BitJuncture);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = Symbol('test');
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = Symbol('test');
        const schema = Juncture.getSchema(jBit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing an object as parameter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of({ myValue: 1 }).prototype).toBeInstanceOf(BitJuncture);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = { myValue: 1 };
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = { myValue: 1 };
        const schema = Juncture.getSchema(jBit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing null as parameter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(null).prototype).toBeInstanceOf(BitJuncture);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = null;
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set to null', () => {
        const defaultValue = null;
        const schema = Juncture.getSchema(jBit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing undefined as parameter', () => {
      test('should return a subclass of Bit', () => {
        expect(jBit.Of(undefined).prototype).toBeInstanceOf(BitJuncture);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = undefined;
        const s1 = jBit.Of(defaultValue);
        const s2 = jBit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set to undefined', () => {
        const defaultValue = undefined;
        const schema = Juncture.getSchema(jBit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });
  });

  describe('settable', () => {
    test('should be an object', () => {
      expect(typeof jBit.settable).toBe('object');
    });

    describe('String', () => {
      test('should return a subclass of SettableStringBit', () => {
        expect(jBit.settable.String.prototype).toBeInstanceOf(SettableStringBitJuncture);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.settable.String;
        const s2 = jBit.settable.String;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value ""', () => {
        const schema = Juncture.getSchema(jBit.settable.String);
        expect(schema.defaultValue).toBe('');
      });
    });

    describe('Number', () => {
      test('should return a subclass of SettableNumberBit', () => {
        expect(jBit.settable.Number.prototype).toBeInstanceOf(SettableNumberBitJuncture);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.settable.Number;
        const s2 = jBit.settable.Number;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value 0', () => {
        const schema = Juncture.getSchema(jBit.settable.Number);
        expect(schema.defaultValue).toBe(0);
      });
    });

    describe('Boolean', () => {
      test('should return a subclass of SettableBooleanBit', () => {
        expect(jBit.settable.Boolean.prototype).toBeInstanceOf(SettableBooleanBitJuncture);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.settable.Boolean;
        const s2 = jBit.settable.Boolean;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value false', () => {
        const schema = Juncture.getSchema(jBit.settable.Boolean);
        expect(schema.defaultValue).toBe(false);
      });
    });

    describe('Symbol', () => {
      test('should return a subclass of SettableSymbolBit', () => {
        expect(jBit.settable.Symbol.prototype).toBeInstanceOf(SettableSymbolBitJuncture);
      });

      test('should always return the same Juncture', () => {
        const s1 = jBit.settable.Symbol;
        const s2 = jBit.settable.Symbol;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value jSymbols.bitDefault', () => {
        const schema = Juncture.getSchema(jBit.settable.Symbol);
        expect(schema.defaultValue).toBe(jSymbols.bitDefault);
      });
    });

    describe('Of', () => {
      test('should be a method', () => {
        expect(typeof jBit.settable.Of).toBe('function');
      });

      describe('when passing an empty string as paramter', () => {
        test('should return a subclass of SettableStringBit', () => {
          expect(jBit.settable.Of('').prototype).toBeInstanceOf(SettableStringBitJuncture);
        });

        test('should always return the same Juncture', () => {
          const s1 = jBit.settable.Of('');
          const s2 = jBit.settable.Of('');
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value ""', () => {
          const schema = Juncture.getSchema(jBit.settable.Of(''));
          expect(schema.defaultValue).toBe('');
        });
      });

      describe('when passing a non-empty string as paramter', () => {
        test('should return a subclass of SettableStringBit', () => {
          expect(jBit.settable.Of('').prototype).toBeInstanceOf(SettableStringBitJuncture);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = 'a';
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = 'X';
          const schema = Juncture.getSchema(jBit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing the number zero as paramter', () => {
        test('should return a subclass of SettableNumberBit', () => {
          expect(jBit.settable.Of(0).prototype).toBeInstanceOf(SettableNumberBitJuncture);
        });

        test('should always return the same Juncture', () => {
          const s1 = jBit.settable.Of(0);
          const s2 = jBit.settable.Of(0);
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value 0', () => {
          const schema = Juncture.getSchema(jBit.settable.Of(0));
          expect(schema.defaultValue).toBe(0);
        });
      });

      describe('when passing a non-zero number as paramter', () => {
        test('should return a subclass of SettableNumberBit', () => {
          expect(jBit.settable.Of(1).prototype).toBeInstanceOf(SettableNumberBitJuncture);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = 1;
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = 2;
          const schema = Juncture.getSchema(jBit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing the boolean value "false" as paramter', () => {
        test('should return a subclass of SettableBooleanBit', () => {
          expect(jBit.settable.Of(false).prototype).toBeInstanceOf(SettableBooleanBitJuncture);
        });

        test('should always return the same Juncture', () => {
          const s1 = jBit.settable.Of(false);
          const s2 = jBit.settable.Of(false);
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value "false"', () => {
          const schema = Juncture.getSchema(jBit.settable.Of(false));
          expect(schema.defaultValue).toBe(false);
        });
      });

      describe('when passing the boolean value "true" as paramter', () => {
        test('should return a subclass of SettableBooleanBit', () => {
          expect(jBit.settable.Of(true).prototype).toBeInstanceOf(SettableBooleanBitJuncture);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = true;
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = true;
          const schema = Juncture.getSchema(jBit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing the symbol jSymbols.bitDefault as paramter', () => {
        test('should return a subclass of SettableSymbolBit', () => {
          expect(jBit.settable.Of(jSymbols.bitDefault).prototype).toBeInstanceOf(SettableSymbolBitJuncture);
        });

        test('should always return the same Juncture', () => {
          const s1 = jBit.settable.Of(jSymbols.bitDefault);
          const s2 = jBit.settable.Of(jSymbols.bitDefault);
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value jSymbols.bitDefault', () => {
          const schema = Juncture.getSchema(jBit.settable.Of(jSymbols.bitDefault));
          expect(schema.defaultValue).toBe(jSymbols.bitDefault);
        });
      });

      describe('when passing a symbol different from jSymbols.bitDefault as paramter', () => {
        test('should return a subclass of SettableSymbolBit', () => {
          expect(jBit.settable.Of(Symbol('test')).prototype).toBeInstanceOf(SettableSymbolBitJuncture);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = Symbol('test');
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = Symbol('test');
          const schema = Juncture.getSchema(jBit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing an object as parameter', () => {
        test('should return a subclass of SettableBit', () => {
          expect(jBit.settable.Of({ myValue: 1 }).prototype).toBeInstanceOf(SettableBitJuncture);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = { myValue: 1 };
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = { myValue: 1 };
          const schema = Juncture.getSchema(jBit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing null as parameter', () => {
        test('should return a subclass of SettableBit', () => {
          expect(jBit.settable.Of(null).prototype).toBeInstanceOf(SettableBitJuncture);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = null;
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set to null', () => {
          const defaultValue = null;
          const schema = Juncture.getSchema(jBit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing undefined as parameter', () => {
        test('should return a subclass of SettableBit', () => {
          expect(jBit.settable.Of(undefined).prototype).toBeInstanceOf(SettableBitJuncture);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = undefined;
          const s1 = jBit.settable.Of(defaultValue);
          const s2 = jBit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set to undefined', () => {
          const defaultValue = undefined;
          const schema = Juncture.getSchema(jBit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });
    });
  });
});
