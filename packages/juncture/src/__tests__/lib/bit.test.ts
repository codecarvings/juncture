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
import { JunctureSchema } from '../../design/schema';
import { Driver } from '../../driver';
import { ForgeableDriver } from '../../forgeable-driver';
import { Juncture } from '../../juncture';
import {
  $Bit, BitDriver, BitForger, BitSchema, SettableBitDriver,
  SettableBooleanBitDriver, SettableNumberBitDriver, SettableStringBitDriver, SettableSymbolBitDriver
} from '../../lib/bit';
import { jSymbols } from '../../symbols';
import { PropertyAssembler } from '../../tool/property-assembler';

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
  test('should be a subclass of ForgeableDriver', () => {
    expect(BitDriver.prototype).toBeInstanceOf(ForgeableDriver);
  });

  test('should be a class instantiable without arguments', () => {
    class MyBit extends BitDriver {
      schema = createSchema(() => new TestBitSchema(undefined));
    }
    const driver = new MyBit();
    expect(driver).toBeInstanceOf(Driver);
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

describe('jBit - Bit Builder', () => {
  test('should be an object', () => {
    expect(typeof $Bit).toBe('object');
  });

  describe('String', () => {
    test('should return a subclass of Bit', () => {
      expect($Bit.String.prototype).toBeInstanceOf(BitDriver);
    });

    test('should always return the same Juncture', () => {
      const s1 = $Bit.String;
      const s2 = $Bit.String;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value ""', () => {
      const schema = Juncture.getSchema($Bit.String);
      expect(schema.defaultValue).toBe('');
    });
  });

  describe('Number', () => {
    test('should return a subclass of Bit', () => {
      expect($Bit.Number.prototype).toBeInstanceOf(BitDriver);
    });

    test('should always return the same Juncture', () => {
      const s1 = $Bit.Number;
      const s2 = $Bit.Number;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value 0', () => {
      const schema = Juncture.getSchema($Bit.Number);
      expect(schema.defaultValue).toBe(0);
    });
  });

  describe('Boolean', () => {
    test('should return a subclass of Bit', () => {
      expect($Bit.Boolean.prototype).toBeInstanceOf(BitDriver);
    });

    test('should always return the same Juncture', () => {
      const s1 = $Bit.Boolean;
      const s2 = $Bit.Boolean;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value false', () => {
      const schema = Juncture.getSchema($Bit.Boolean);
      expect(schema.defaultValue).toBe(false);
    });
  });

  describe('Symbol', () => {
    test('should return a subclass of Bit', () => {
      expect($Bit.Symbol.prototype).toBeInstanceOf(BitDriver);
    });

    test('should always return the same Juncture', () => {
      const s1 = $Bit.Symbol;
      const s2 = $Bit.Symbol;
      expect(s2).toBe(s1);
    });

    test('should return a Juncture with default value jSymbols.bitDefault', () => {
      const schema = Juncture.getSchema($Bit.Symbol);
      expect(schema.defaultValue).toBe(jSymbols.bitDefault);
    });
  });

  describe('Of', () => {
    test('should be a method', () => {
      expect(typeof $Bit.Of).toBe('function');
    });

    describe('when passing an empty string as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect($Bit.Of('').prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = $Bit.Of('');
        const s2 = $Bit.Of('');
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value ""', () => {
        const schema = Juncture.getSchema($Bit.Of(''));
        expect(schema.defaultValue).toBe('');
      });
    });

    describe('when passing a non-empty string as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect($Bit.Of('').prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = 'a';
        const s1 = $Bit.Of(defaultValue);
        const s2 = $Bit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = 'X';
        const schema = Juncture.getSchema($Bit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing the number zero as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect($Bit.Of(0).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = $Bit.Of(0);
        const s2 = $Bit.Of(0);
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value 0', () => {
        const schema = Juncture.getSchema($Bit.Of(0));
        expect(schema.defaultValue).toBe(0);
      });
    });

    describe('when passing a non-zero number as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect($Bit.Of(1).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = 1;
        const s1 = $Bit.Of(defaultValue);
        const s2 = $Bit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = 2;
        const schema = Juncture.getSchema($Bit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing the boolean value "false" as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect($Bit.Of(false).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = $Bit.Of(false);
        const s2 = $Bit.Of(false);
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value "false"', () => {
        const schema = Juncture.getSchema($Bit.Of(false));
        expect(schema.defaultValue).toBe(false);
      });
    });

    describe('when passing the boolean value "true" as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect($Bit.Of(true).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = true;
        const s1 = $Bit.Of(defaultValue);
        const s2 = $Bit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = true;
        const schema = Juncture.getSchema($Bit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing the symbol jSymbols.bitDefault as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect($Bit.Of(jSymbols.bitDefault).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = $Bit.Of(jSymbols.bitDefault);
        const s2 = $Bit.Of(jSymbols.bitDefault);
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value jSymbols.bitDefault', () => {
        const schema = Juncture.getSchema($Bit.Of(jSymbols.bitDefault));
        expect(schema.defaultValue).toBe(jSymbols.bitDefault);
      });
    });

    describe('when passing a symbol different from jSymbols.bitDefault as paramter', () => {
      test('should return a subclass of Bit', () => {
        expect($Bit.Of(Symbol('test')).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = Symbol('test');
        const s1 = $Bit.Of(defaultValue);
        const s2 = $Bit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = Symbol('test');
        const schema = Juncture.getSchema($Bit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing an object as parameter', () => {
      test('should return a subclass of Bit', () => {
        expect($Bit.Of({ myValue: 1 }).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = { myValue: 1 };
        const s1 = $Bit.Of(defaultValue);
        const s2 = $Bit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set', () => {
        const defaultValue = { myValue: 1 };
        const schema = Juncture.getSchema($Bit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing null as parameter', () => {
      test('should return a subclass of Bit', () => {
        expect($Bit.Of(null).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = null;
        const s1 = $Bit.Of(defaultValue);
        const s2 = $Bit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set to null', () => {
        const defaultValue = null;
        const schema = Juncture.getSchema($Bit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });

    describe('when passing undefined as parameter', () => {
      test('should return a subclass of Bit', () => {
        expect($Bit.Of(undefined).prototype).toBeInstanceOf(BitDriver);
      });

      test('should always return a different Juncture', () => {
        const defaultValue = undefined;
        const s1 = $Bit.Of(defaultValue);
        const s2 = $Bit.Of(defaultValue);
        expect(s2).not.toBe(s1);
      });

      test('should return a Juncture with default value set to undefined', () => {
        const defaultValue = undefined;
        const schema = Juncture.getSchema($Bit.Of(defaultValue));
        expect(schema.defaultValue).toBe(defaultValue);
      });
    });
  });

  describe('settable', () => {
    test('should be an object', () => {
      expect(typeof $Bit.settable).toBe('object');
    });

    describe('String', () => {
      test('should return a subclass of SettableStringBit', () => {
        expect($Bit.settable.String.prototype).toBeInstanceOf(SettableStringBitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = $Bit.settable.String;
        const s2 = $Bit.settable.String;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value ""', () => {
        const schema = Juncture.getSchema($Bit.settable.String);
        expect(schema.defaultValue).toBe('');
      });
    });

    describe('Number', () => {
      test('should return a subclass of SettableNumberBit', () => {
        expect($Bit.settable.Number.prototype).toBeInstanceOf(SettableNumberBitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = $Bit.settable.Number;
        const s2 = $Bit.settable.Number;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value 0', () => {
        const schema = Juncture.getSchema($Bit.settable.Number);
        expect(schema.defaultValue).toBe(0);
      });
    });

    describe('Boolean', () => {
      test('should return a subclass of SettableBooleanBit', () => {
        expect($Bit.settable.Boolean.prototype).toBeInstanceOf(SettableBooleanBitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = $Bit.settable.Boolean;
        const s2 = $Bit.settable.Boolean;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value false', () => {
        const schema = Juncture.getSchema($Bit.settable.Boolean);
        expect(schema.defaultValue).toBe(false);
      });
    });

    describe('Symbol', () => {
      test('should return a subclass of SettableSymbolBit', () => {
        expect($Bit.settable.Symbol.prototype).toBeInstanceOf(SettableSymbolBitDriver);
      });

      test('should always return the same Juncture', () => {
        const s1 = $Bit.settable.Symbol;
        const s2 = $Bit.settable.Symbol;
        expect(s2).toBe(s1);
      });

      test('should return a Juncture with default value jSymbols.bitDefault', () => {
        const schema = Juncture.getSchema($Bit.settable.Symbol);
        expect(schema.defaultValue).toBe(jSymbols.bitDefault);
      });
    });

    describe('Of', () => {
      test('should be a method', () => {
        expect(typeof $Bit.settable.Of).toBe('function');
      });

      describe('when passing an empty string as paramter', () => {
        test('should return a subclass of SettableStringBit', () => {
          expect($Bit.settable.Of('').prototype).toBeInstanceOf(SettableStringBitDriver);
        });

        test('should always return the same Juncture', () => {
          const s1 = $Bit.settable.Of('');
          const s2 = $Bit.settable.Of('');
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value ""', () => {
          const schema = Juncture.getSchema($Bit.settable.Of(''));
          expect(schema.defaultValue).toBe('');
        });
      });

      describe('when passing a non-empty string as paramter', () => {
        test('should return a subclass of SettableStringBit', () => {
          expect($Bit.settable.Of('').prototype).toBeInstanceOf(SettableStringBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = 'a';
          const s1 = $Bit.settable.Of(defaultValue);
          const s2 = $Bit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = 'X';
          const schema = Juncture.getSchema($Bit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing the number zero as paramter', () => {
        test('should return a subclass of SettableNumberBit', () => {
          expect($Bit.settable.Of(0).prototype).toBeInstanceOf(SettableNumberBitDriver);
        });

        test('should always return the same Juncture', () => {
          const s1 = $Bit.settable.Of(0);
          const s2 = $Bit.settable.Of(0);
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value 0', () => {
          const schema = Juncture.getSchema($Bit.settable.Of(0));
          expect(schema.defaultValue).toBe(0);
        });
      });

      describe('when passing a non-zero number as paramter', () => {
        test('should return a subclass of SettableNumberBit', () => {
          expect($Bit.settable.Of(1).prototype).toBeInstanceOf(SettableNumberBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = 1;
          const s1 = $Bit.settable.Of(defaultValue);
          const s2 = $Bit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = 2;
          const schema = Juncture.getSchema($Bit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing the boolean value "false" as paramter', () => {
        test('should return a subclass of SettableBooleanBit', () => {
          expect($Bit.settable.Of(false).prototype).toBeInstanceOf(SettableBooleanBitDriver);
        });

        test('should always return the same Juncture', () => {
          const s1 = $Bit.settable.Of(false);
          const s2 = $Bit.settable.Of(false);
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value "false"', () => {
          const schema = Juncture.getSchema($Bit.settable.Of(false));
          expect(schema.defaultValue).toBe(false);
        });
      });

      describe('when passing the boolean value "true" as paramter', () => {
        test('should return a subclass of SettableBooleanBit', () => {
          expect($Bit.settable.Of(true).prototype).toBeInstanceOf(SettableBooleanBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = true;
          const s1 = $Bit.settable.Of(defaultValue);
          const s2 = $Bit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = true;
          const schema = Juncture.getSchema($Bit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing the symbol jSymbols.bitDefault as paramter', () => {
        test('should return a subclass of SettableSymbolBit', () => {
          expect($Bit.settable.Of(jSymbols.bitDefault).prototype).toBeInstanceOf(SettableSymbolBitDriver);
        });

        test('should always return the same Juncture', () => {
          const s1 = $Bit.settable.Of(jSymbols.bitDefault);
          const s2 = $Bit.settable.Of(jSymbols.bitDefault);
          expect(s2).toBe(s1);
        });

        test('should return a Juncture with default value jSymbols.bitDefault', () => {
          const schema = Juncture.getSchema($Bit.settable.Of(jSymbols.bitDefault));
          expect(schema.defaultValue).toBe(jSymbols.bitDefault);
        });
      });

      describe('when passing a symbol different from jSymbols.bitDefault as paramter', () => {
        test('should return a subclass of SettableSymbolBit', () => {
          expect($Bit.settable.Of(Symbol('test')).prototype).toBeInstanceOf(SettableSymbolBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = Symbol('test');
          const s1 = $Bit.settable.Of(defaultValue);
          const s2 = $Bit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = Symbol('test');
          const schema = Juncture.getSchema($Bit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing an object as parameter', () => {
        test('should return a subclass of SettableBit', () => {
          expect($Bit.settable.Of({ myValue: 1 }).prototype).toBeInstanceOf(SettableBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = { myValue: 1 };
          const s1 = $Bit.settable.Of(defaultValue);
          const s2 = $Bit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set', () => {
          const defaultValue = { myValue: 1 };
          const schema = Juncture.getSchema($Bit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing null as parameter', () => {
        test('should return a subclass of SettableBit', () => {
          expect($Bit.settable.Of(null).prototype).toBeInstanceOf(SettableBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = null;
          const s1 = $Bit.settable.Of(defaultValue);
          const s2 = $Bit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set to null', () => {
          const defaultValue = null;
          const schema = Juncture.getSchema($Bit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });

      describe('when passing undefined as parameter', () => {
        test('should return a subclass of SettableBit', () => {
          expect($Bit.settable.Of(undefined).prototype).toBeInstanceOf(SettableBitDriver);
        });

        test('should always return a different Juncture', () => {
          const defaultValue = undefined;
          const s1 = $Bit.settable.Of(defaultValue);
          const s2 = $Bit.settable.Of(defaultValue);
          expect(s2).not.toBe(s1);
        });

        test('should return a Juncture with default value set to undefined', () => {
          const defaultValue = undefined;
          const schema = Juncture.getSchema($Bit.settable.Of(defaultValue));
          expect(schema.defaultValue).toBe(defaultValue);
        });
      });
    });
  });
});
