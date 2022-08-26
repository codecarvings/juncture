/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DescriptorType } from '../design/descriptor-type';
import { BodyOfSchema, createSchema, Schema } from '../design/descriptors/schema';
import { JunctureSchema, ValueOfSchema } from '../design/schema';
import { ValueOf } from '../driver';
import { OverrideSchemaFrame } from '../engine/frames/schema-frame';
import { ForgeableDriver } from '../forgeable-driver';
import { CreateDescriptorForOverrideArgs, Forger } from '../forger';
import { AlterablePartialJuncture, Juncture } from '../juncture';
import { jSymbols } from '../symbols';

// #region Value & Schema
export class BitSchema<V = any> extends JunctureSchema<V> {
  // Constructor is protected because type of the value cannot be changed in an inherited class
  // to avoid problems with triggers in the super class
  // Example:
  // Super class type is { firstName: string }), if sub - class is chaged to { firstName: string, lastName: string }
  // triggers in the super class will cause inexpected problems
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
          const parent = args.parent[jSymbols.payload]();
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

// #region Driver
export abstract class BitDriver extends ForgeableDriver {
  abstract readonly schema: Schema<BitSchema>;

  protected [jSymbols.createForger](): BitForger<this> {
    return new BitForger(this);
  }

  protected readonly FORGE!: BitForger<this>;
}
// #endregion

// #region Specializations
export abstract class SettableBitDriver extends BitDriver {
  reset = this.FORGE.reducer(({ select }) => () => select().defaultValue);

  set = this.FORGE.reducer(() => (value: ValueOf<this>) => value);
}

export abstract class SettableStringBitDriver extends SettableBitDriver {
  abstract schema: Schema<BitSchema<string>>;
}

export abstract class SettableNumberBitDriver extends SettableBitDriver {
  abstract schema: Schema<BitSchema<number>>;

  add = this.FORGE.reducer(({ value }) => (num: number) => value() + num);

  inc = this.FORGE.reducer(({ value }) => () => value() + 1);

  dec = this.FORGE.reducer(({ value }) => () => value() - 1);
}

export abstract class SettableBooleanBitDriver extends SettableBitDriver {
  abstract schema: Schema<BitSchema<boolean>>;

  switch = this.FORGE.reducer(({ value }) => () => !value());
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
function createBitJuncture<J extends AlterablePartialJuncture<BitDriver>>(BaseJuncture: J, defaultValue: any) {
  abstract class Bit extends BaseJuncture {
    schema = createSchema(() => createBitSchema(defaultValue));
  }
  return Bit;
}

const defaultStringValue = '';
const defaultNumberValue = 0;
const defaultBooleanValue = false;
const defaultSymbolValue = jSymbols.bitDefault;

class DefaultStringBit extends createBitJuncture(BitDriver, defaultStringValue) { }
class DefaultNumberBit extends createBitJuncture(BitDriver, defaultNumberValue) { }
class DefaultBooleanBit extends createBitJuncture(BitDriver, defaultBooleanValue) { }
class DefaultSymbolBit extends createBitJuncture(BitDriver, defaultSymbolValue) { }

class DefaultSettableStringBit extends createBitJuncture(SettableStringBitDriver, defaultStringValue) { }
class DefaultSettableNumberBit extends createBitJuncture(SettableNumberBitDriver, defaultNumberValue) { }
class DefaultSettableBooleanBit extends createBitJuncture(SettableBooleanBitDriver, defaultBooleanValue) { }
class DefaultSettableSymbolBit extends createBitJuncture(SettableSymbolBitDriver, defaultSymbolValue) { }

interface BitJunctureBuilder {
  readonly String: StringBitJuncture;
  readonly Number: NumberBitJuncture;
  readonly Boolean: BooleanBitJuncture;
  readonly Symbol: SymbolBitJuncture;
  readonly Of: {
    (defaultValue: string): StringBitJuncture;
    (defaultValue: number): NumberBitJuncture;
    (defaultValue: boolean): BooleanBitJuncture;
    (defaultValue: symbol): SymbolBitJuncture;
    <V>(defaultValue: V): BitJuncture<V>;
  };

  readonly settable: {
    readonly String: SettableStringBitJuncture;
    readonly Number: SettableNumberBitJuncture;
    readonly Boolean: SettableBooleanBitJuncture;
    readonly Symbol: SettableSymbolBitJuncture;
    readonly Of: {
      (defaultValue: string): SettableStringBitJuncture;
      (defaultValue: number): SettableNumberBitJuncture;
      (defaultValue: boolean): SettableBooleanBitJuncture;
      (defaultValue: symbol): SettableSymbolBitJuncture;
      <V>(defaultValue: V): SettableBitJuncture<V>;
    }
  }
}

export const $Bit: BitJunctureBuilder = {
  String: DefaultStringBit,
  Number: DefaultNumberBit,
  Boolean: DefaultBooleanBit,
  Symbol: DefaultSymbolBit,
  Of: <V>(defaultValue: V) => {
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
    String: DefaultSettableStringBit,
    Number: DefaultSettableNumberBit,
    Boolean: DefaultSettableBooleanBit,
    Symbol: DefaultSettableSymbolBit,
    Of: <V>(defaultValue: V) => {
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
      let Juncture: any;
      switch (type) {
        case 'string':
          Juncture = SettableStringBitDriver;
          break;
        case 'number':
          Juncture = SettableNumberBitDriver;
          break;
        case 'boolean':
          Juncture = SettableBooleanBitDriver;
          break;
        case 'symbol':
          Juncture = SettableSymbolBitDriver;
          break;
        default:
          Juncture = SettableBitDriver;
          break;
      }
      return createBitJuncture(Juncture, defaultValue);
    }
  }
};
// #endregion
