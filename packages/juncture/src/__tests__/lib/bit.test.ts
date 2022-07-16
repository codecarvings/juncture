/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchemaDef, Schema } from '../../definition/schema';
import { Juncture } from '../../juncture';
import {
  Bit, BitDefComposer, BitSchema, jBit, SettableBit,
  SettableBooleanBit, SettableNumberBit, SettableStringBit, SettableSymbolBit
} from '../../lib/bit';
import { jSymbols } from '../../symbols';

describe('BitSchema', () => {
  test('should be a subclass of Schema', () => {
    expect(BitSchema.prototype).toBeInstanceOf(Schema);
  });

  test('should be a class instantiable by passing any type of defaultValue', () => {
    expect(typeof new BitSchema('')).toBe('object');
    expect(typeof new BitSchema(1)).toBe('object');
    expect(typeof new BitSchema(true)).toBe('object');
    expect(typeof new BitSchema({ myValue: 1 })).toBe('object');
    expect(typeof new BitSchema(undefined)).toBe('object');
    expect(typeof new BitSchema(null)).toBe('object');
  });

  test('should have a "defaultProperty" contianing the same value passed to the constructor', () => {
    const defaultValue = { myValue: 1 };
    const schema = new BitSchema(defaultValue);
    expect(schema.defaultValue).toBe(defaultValue);
  });
});

xdescribe('BitDefComposer', () => {
  // TODO: Implement this
});

describe('Bit', () => {
  test('should be a subclass of Juncture', () => {
    expect(jBit.String.prototype).toBeInstanceOf(Juncture);
  });

  test('should has BitDefComposer as composer', () => {
    class MyBit extends Bit {
      schema = createSchemaDef(() => new BitSchema(undefined));
    }
    const myBit = Juncture.getInstance(MyBit);
    expect((myBit as any).DEF).toBeInstanceOf(BitDefComposer);
  });
});

xdescribe('SettableBit', () => {
  // TODO: Implement this
});

xdescribe('SettableStringBit', () => {
  // TODO: Implement this
});

xdescribe('SettableNumberBit', () => {
  // TODO: Implement this
});

xdescribe('SettableBooleanBit', () => {
  // TODO: Implement this
});

xdescribe('SettableSymbolBit', () => {
  // TODO: Implement this
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
