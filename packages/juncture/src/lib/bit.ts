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
import { OverrideSchemaFrame } from '../engine/frames/schema-frame';
import { ForgeableJuncture } from '../forgeable-juncture';
import { CreateDescriptorForOverrideArgs, Forger } from '../forger';
import { Juncture, JunctureCtor, ValueOf } from '../juncture';
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
export class BitForger<J extends BitJuncture> extends Forger<J> {
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

  readonly override!: Forger<J>['override'] & {
    <D extends Schema<BitSchema<any>>>(parent: D): {
      setDefaultValue<F extends (frame: OverrideSchemaFrame<BodyOfSchema<D>>)
      => ValueOfSchema<BodyOfSchema<D>>>
      (selectorFn: F): D;
    };
  };
}
// #endregion

// #region Juncture
export abstract class BitJuncture extends ForgeableJuncture {
  abstract readonly schema: Schema<BitSchema>;

  protected [jSymbols.createForger](): BitForger<this> {
    return new BitForger<this>(Juncture.getPropertyAssembler(this));
  }

  protected readonly FORGE!: BitForger<this>;
}
// #endregion

// #region Specializations
export abstract class SettableBitJuncture extends BitJuncture {
  reset = this.FORGE.reducer(({ select }) => () => select().defaultValue);

  set = this.FORGE.reducer(() => (value: ValueOf<this>) => value);
}

export abstract class SettableStringBitJuncture extends SettableBitJuncture {
  abstract schema: Schema<BitSchema<string>>;
}

export abstract class SettableNumberBitJuncture extends SettableBitJuncture {
  abstract schema: Schema<BitSchema<number>>;

  add = this.FORGE.reducer(({ value }) => (num: number) => value() + num);

  inc = this.FORGE.reducer(({ value }) => () => value() + 1);

  dec = this.FORGE.reducer(({ value }) => () => value() - 1);
}

export abstract class SettableBooleanBitJuncture extends SettableBitJuncture {
  abstract schema: Schema<BitSchema<boolean>>;

  switch = this.FORGE.reducer(({ value }) => () => !value());
}

export abstract class SettableSymbolBitJuncture extends SettableBitJuncture {
  abstract schema: Schema<BitSchema<symbol>>;
}
// #endregion

// #region Builder types
// --- Inert
interface Bit<V> extends BitJuncture {
  schema: Schema<BitSchema<V>>;
}
interface BitCtor<V> extends JunctureCtor<Bit<V>> { }

interface StringBit extends Bit<string> { }
interface StringBitCtor extends JunctureCtor<StringBit> { }

interface NumberBit extends Bit<number> { }
interface NumberBitCtor extends JunctureCtor<NumberBit> { }

interface BooleanBit extends Bit<boolean> { }
interface BooleanBitCtor extends JunctureCtor<BooleanBit> { }

interface SymbolBit extends Bit<symbol> { }
interface SymbolBitCtor extends JunctureCtor<SymbolBit> { }

// --- Settable
interface SettableBit<V> extends SettableBitJuncture {
  schema: Schema<BitSchema<V>>;
}
interface SettableBitCtor<V> extends JunctureCtor<SettableBit<V>> { }

interface SettableStringBit extends SettableStringBitJuncture {
  schema: Schema<BitSchema<string>>;
}
interface SettableStringBitCtor extends JunctureCtor<SettableStringBit> { }

interface SettableNumberBit extends SettableNumberBitJuncture {
  schema: Schema<BitSchema<number>>;
}
interface SettableNumberBitCtor extends JunctureCtor<SettableNumberBit> { }

interface SettableBooleanBit extends SettableBooleanBitJuncture {
  schema: Schema<BitSchema<boolean>>;
}
interface SettableBooleanBitCtor extends JunctureCtor<SettableBooleanBit> { }

interface SettableSymbolBit extends SettableSymbolBitJuncture {
  schema: Schema<BitSchema<symbol>>;
}
interface SettableSymbolBitCtor extends JunctureCtor<SettableSymbolBit> { }
// #endregion

// #region Builder
function createBitCtor<JT extends abstract new(...args: any) => BitJuncture>(BaseCtor: JT, defaultValue: any) {
  abstract class Bit extends BaseCtor {
    schema = createSchema(() => createBitSchema(defaultValue));
  }
  return Bit;
}

const defaultStringValue = '';
const defaultNumberValue = 0;
const defaultBooleanValue = false;
const defaultSymbolValue = jSymbols.bitDefault;

class DefaultStringBit extends createBitCtor(BitJuncture, defaultStringValue) { }
class DefaultNumberBit extends createBitCtor(BitJuncture, defaultNumberValue) { }
class DefaultBooleanBit extends createBitCtor(BitJuncture, defaultBooleanValue) { }
class DefaultSymbolBit extends createBitCtor(BitJuncture, defaultSymbolValue) { }

class DefaultSettableStringBit extends createBitCtor(SettableStringBitJuncture, defaultStringValue) { }
class DefaultSettableNumberBit extends createBitCtor(SettableNumberBitJuncture, defaultNumberValue) { }
class DefaultSettableBooleanBit extends createBitCtor(SettableBooleanBitJuncture, defaultBooleanValue) { }
class DefaultSettableSymbolBit extends createBitCtor(SettableSymbolBitJuncture, defaultSymbolValue) { }

interface BitBuilder {
  readonly String: StringBitCtor;
  readonly Number: NumberBitCtor;
  readonly Boolean: BooleanBitCtor;
  readonly Symbol: SymbolBitCtor;
  readonly Of: {
    (defaultValue: string): StringBitCtor;
    (defaultValue: number): NumberBitCtor;
    (defaultValue: boolean): BooleanBitCtor;
    (defaultValue: symbol): SymbolBitCtor;
    <V>(defaultValue: V): BitCtor<V>;
  };

  readonly settable: {
    readonly String: SettableStringBitCtor;
    readonly Number: SettableNumberBitCtor;
    readonly Boolean: SettableBooleanBitCtor;
    readonly Symbol: SettableSymbolBitCtor;
    readonly Of: {
      (defaultValue: string): SettableStringBitCtor;
      (defaultValue: number): SettableNumberBitCtor;
      (defaultValue: boolean): SettableBooleanBitCtor;
      (defaultValue: symbol): SettableSymbolBitCtor;
      <V>(defaultValue: V): SettableBitCtor<V>;
    }
  }
}

export const jBit: BitBuilder = {
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

    return createBitCtor(BitJuncture, defaultValue) as any;
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
      let Ctor: any;
      switch (type) {
        case 'string':
          Ctor = SettableStringBitJuncture;
          break;
        case 'number':
          Ctor = SettableNumberBitJuncture;
          break;
        case 'boolean':
          Ctor = SettableBooleanBitJuncture;
          break;
        case 'symbol':
          Ctor = SettableSymbolBitJuncture;
          break;
        default:
          Ctor = SettableBitJuncture;
          break;
      }
      return createBitCtor(Ctor, defaultValue);
    }
  }
};
// #endregion
