/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DescriptorType } from '../design/descriptor-type';
import { BodyOfSchema, createSchema, Schema } from '../design/descriptors/schema';
import { ValueOf } from '../driver';
import { ForgeableDriver } from '../forgeable-driver';
import { CreateDescriptorForOverrideArgs, Forger } from '../forger';
import { AlterablePartialJuncture, Juncture } from '../juncture';
import { junctureSymbols } from '../juncture-symbols';
import { Cursor } from '../operation/frame-equipment/cursor';
import { OverrideSchemaFrame } from '../operation/frames/schema-frame';
import { Realm } from '../operation/realm';
import { JunctureSchema, ValueOfSchema } from '../schema';

// #region Value & Schema
export class BitSchema<V = any> extends JunctureSchema<V> {
  // Constructor is protected because type of the value cannot be changed in an inherited class
  // to avoid problems with reactors in the super class
  // Example:
  // Super class type is { firstName: string }), if sub - class is chaged to { firstName: string, lastName: string }
  // reactors in the super class will cause inexpected problems
  protected constructor(defaultValue: V) {
    super(defaultValue);
  }
}

function createBitSchema<V>(defaultValue: V): BitSchema<V> {
  return new (BitSchema as any)(defaultValue);
}
// #endregion

// #region Forger
export class BitForger<D extends BitDriver> extends Forger<D> {
  protected createDescriptorForOverride(args: CreateDescriptorForOverrideArgs) {
    if (args.parent.type === DescriptorType.schema) {
      if (args.fnName === 'setDefaultValue') {
        return createSchema(() => {
          const parent = args.parent[junctureSymbols.payload]();
          const frame2 = { parent };
          const defaultValue2 = args.fnArgs[0](frame2);
          return createBitSchema(defaultValue2);
        });
      }
    }

    return super.createDescriptorForOverride(args);
  }

  readonly override!: Forger<D>['override'] & {
    <L extends Schema<BitSchema<any>>>(parent: L): {
      setDefaultValue<F extends (frame: OverrideSchemaFrame<BodyOfSchema<L>>)
      => ValueOfSchema<BodyOfSchema<L>>>
      (selectorFn: F): L;
    };
  };
}
// #endregion

// #region Operation
export type BitCursor<D extends BitDriver> = Cursor<D>;
export type BitXpCursor<D extends BitDriver> = Cursor<D>;
// #endregion

// #region Driver
export abstract class BitDriver extends ForgeableDriver {
  abstract readonly schema: Schema<BitSchema>;

  protected [junctureSymbols.createForger](): BitForger<this> {
    return new BitForger(this);
  }

  [junctureSymbols.createCursor](realm: Realm): BitCursor<this> {
    return super[junctureSymbols.createCursor](realm);
  }

  [junctureSymbols.createXpCursor](realm: Realm): BitXpCursor<this> {
    return super[junctureSymbols.createXpCursor](realm);
  }

  protected readonly FORGE!: BitForger<this>;
}
// #endregion

// #region Specializations
export abstract class SettableBitDriver extends BitDriver {
  'reactor.reset' = this.FORGE.reactor(
    ({ select }) => (): ValueOf<this> => select().defaultValue
  );

  'reactor.set' = this.FORGE.reactor(
    () => (value: ValueOf<this>) => value
  );
}

export abstract class SettableStringBitDriver extends SettableBitDriver {
  abstract schema: Schema<BitSchema<string>>;
}

export abstract class SettableNumberBitDriver extends SettableBitDriver {
  abstract schema: Schema<BitSchema<number>>;

  'reactor.add' = this.FORGE.reactor(
    ({ get }) => (num: number) => get() + num
  );

  'reactor.inc' = this.FORGE.reactor(
    ({ get }) => () => get() + 1
  );

  'reactor.dec' = this.FORGE.reactor(
    ({ get }) => () => get() - 1
  );
}

export abstract class SettableBooleanBitDriver extends SettableBitDriver {
  abstract schema: Schema<BitSchema<boolean>>;

  'reactor.switch' = this.FORGE.reactor(
    ({ get }) => () => !get()
  );
}

export abstract class SettableSymbolBitDriver extends SettableBitDriver {
  abstract schema: Schema<BitSchema<symbol>>;
}
// #endregion

// #region Juncture
// --- Inert
interface Bit<V> extends BitDriver {
  schema: Schema<BitSchema<V>>;
}
interface BitJuncture<V> extends Juncture<Bit<V>> { }

interface StringBit extends Bit<string> { }
interface StringBitJuncture extends Juncture<StringBit> { }

interface NumberBit extends Bit<number> { }
interface NumberBitJuncture extends Juncture<NumberBit> { }

interface BooleanBit extends Bit<boolean> { }
interface BooleanBitJuncture extends Juncture<BooleanBit> { }

interface SymbolBit extends Bit<symbol> { }
interface SymbolBitJuncture extends Juncture<SymbolBit> { }

// --- Settable
interface SettableBit<V> extends SettableBitDriver {
  schema: Schema<BitSchema<V>>;
}
interface SettableBitJuncture<V> extends Juncture<SettableBit<V>> { }

interface SettableStringBit extends SettableStringBitDriver {
  schema: Schema<BitSchema<string>>;
}
interface SettableStringBitJuncture extends Juncture<SettableStringBit> { }

interface SettableNumberBit extends SettableNumberBitDriver {
  schema: Schema<BitSchema<number>>;
}
interface SettableNumberBitJuncture extends Juncture<SettableNumberBit> { }

interface SettableBooleanBit extends SettableBooleanBitDriver {
  schema: Schema<BitSchema<boolean>>;
}
interface SettableBooleanBitJuncture extends Juncture<SettableBooleanBit> { }

interface SettableSymbolBit extends SettableSymbolBitDriver {
  schema: Schema<BitSchema<symbol>>;
}
interface SettableSymbolBitJuncture extends Juncture<SettableSymbolBit> { }
// #endregion

// #region Builder
function createBitJuncture<J extends AlterablePartialJuncture<BitDriver>>(baseJuncture: J, defaultValue: any) {
  abstract class Bit extends baseJuncture {
    schema = createSchema(() => createBitSchema(defaultValue));
  }
  return Bit;
}

const defaultStringValue = '';
const defaultNumberValue = 0;
const defaultBooleanValue = false;
const defaultSymbolValue = junctureSymbols.bitDefault;

class DefaultStringBit extends createBitJuncture(BitDriver, defaultStringValue) { }
class DefaultNumberBit extends createBitJuncture(BitDriver, defaultNumberValue) { }
class DefaultBooleanBit extends createBitJuncture(BitDriver, defaultBooleanValue) { }
class DefaultSymbolBit extends createBitJuncture(BitDriver, defaultSymbolValue) { }

class DefaultSettableStringBit extends createBitJuncture(SettableStringBitDriver, defaultStringValue) { }
class DefaultSettableNumberBit extends createBitJuncture(SettableNumberBitDriver, defaultNumberValue) { }
class DefaultSettableBooleanBit extends createBitJuncture(SettableBooleanBitDriver, defaultBooleanValue) { }
class DefaultSettableSymbolBit extends createBitJuncture(SettableSymbolBitDriver, defaultSymbolValue) { }

interface BitJunctureBuilder {
  readonly string: StringBitJuncture;
  readonly number: NumberBitJuncture;
  readonly boolean: BooleanBitJuncture;
  readonly symbol: SymbolBitJuncture;
  readonly of: {
    (defaultValue: string): StringBitJuncture;
    (defaultValue: number): NumberBitJuncture;
    (defaultValue: boolean): BooleanBitJuncture;
    (defaultValue: symbol): SymbolBitJuncture;
    <V>(defaultValue: V): BitJuncture<V>;
  };

  readonly settable: {
    readonly string: SettableStringBitJuncture;
    readonly number: SettableNumberBitJuncture;
    readonly boolean: SettableBooleanBitJuncture;
    readonly symbol: SettableSymbolBitJuncture;
    readonly of: {
      (defaultValue: string): SettableStringBitJuncture;
      (defaultValue: number): SettableNumberBitJuncture;
      (defaultValue: boolean): SettableBooleanBitJuncture;
      (defaultValue: symbol): SettableSymbolBitJuncture;
      <V>(defaultValue: V): SettableBitJuncture<V>;
    }
  }
}

export const BIT: BitJunctureBuilder = {
  string: DefaultStringBit,
  number: DefaultNumberBit,
  boolean: DefaultBooleanBit,
  symbol: DefaultSymbolBit,
  of<V>(defaultValue: V) {
    if (defaultValue as any === defaultStringValue) {
      return DefaultStringBit;
    }
    if (defaultValue as any === defaultNumberValue) {
      return DefaultNumberBit;
    }
    if (defaultValue as any === defaultBooleanValue) {
      return DefaultBooleanBit;
    }
    if (defaultValue as any === defaultSymbolValue) {
      return DefaultSymbolBit;
    }

    return createBitJuncture(BitDriver, defaultValue) as any;
  },

  settable: {
    string: DefaultSettableStringBit,
    number: DefaultSettableNumberBit,
    boolean: DefaultSettableBooleanBit,
    symbol: DefaultSettableSymbolBit,
    of<V>(defaultValue: V) {
      if (defaultValue as any === defaultStringValue) {
        return DefaultSettableStringBit;
      }
      if (defaultValue as any === defaultNumberValue) {
        return DefaultSettableNumberBit;
      }
      if (defaultValue as any === defaultBooleanValue) {
        return DefaultSettableBooleanBit;
      }
      if (defaultValue as any === defaultSymbolValue) {
        return DefaultSettableSymbolBit;
      }

      const type = typeof defaultValue;
      let juncture: any;
      switch (type) {
        case 'string':
          juncture = SettableStringBitDriver;
          break;
        case 'number':
          juncture = SettableNumberBitDriver;
          break;
        case 'boolean':
          juncture = SettableBooleanBitDriver;
          break;
        case 'symbol':
          juncture = SettableSymbolBitDriver;
          break;
        default:
          juncture = SettableBitDriver;
          break;
      }
      return createBitJuncture(juncture, defaultValue);
    }
  }
};
// #endregion
