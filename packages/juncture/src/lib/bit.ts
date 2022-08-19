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
import { Juncture, JunctureType, ValueOf } from '../juncture';
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
interface BitType<V> extends JunctureType<Bit<V>> { }

interface StringBit extends Bit<string> { }
interface StringBitType extends JunctureType<StringBit> { }

interface NumberBit extends Bit<number> { }
interface NumberBitType extends JunctureType<NumberBit> { }

interface BooleanBit extends Bit<boolean> { }
interface BooleanBitType extends JunctureType<BooleanBit> { }

interface SymbolBit extends Bit<symbol> { }
interface SymbolBitType extends JunctureType<SymbolBit> { }

// --- Settable
interface SettableBit<V> extends SettableBitJuncture {
  schema: Schema<BitSchema<V>>;
}
interface SettableBitType<V> extends JunctureType<SettableBit<V>> { }

interface SettableStringBit extends SettableStringBitJuncture {
  schema: Schema<BitSchema<string>>;
}
interface SettableStringBitType extends JunctureType<SettableStringBit> { }

interface SettableNumberBit extends SettableNumberBitJuncture {
  schema: Schema<BitSchema<number>>;
}
interface SettableNumberBitType extends JunctureType<SettableNumberBit> { }

interface SettableBooleanBit extends SettableBooleanBitJuncture {
  schema: Schema<BitSchema<boolean>>;
}
interface SettableBooleanBitType extends JunctureType<SettableBooleanBit> { }

interface SettableSymbolBit extends SettableSymbolBitJuncture {
  schema: Schema<BitSchema<symbol>>;
}
interface SettableSymbolBitType extends JunctureType<SettableSymbolBit> { }
// #endregion

// #region Builder
function createBitType<JT extends abstract new(...args: any) => BitJuncture>(BaseType: JT, defaultValue: any) {
  abstract class Bit extends BaseType {
    schema = createSchema(() => createBitSchema(defaultValue));
  }
  return Bit;
}

const defaultStringValue = '';
const defaultNumberValue = 0;
const defaultBooleanValue = false;
const defaultSymbolValue = jSymbols.bitDefault;

class DefaultStringBit extends createBitType(BitJuncture, defaultStringValue) { }
class DefaultNumberBit extends createBitType(BitJuncture, defaultNumberValue) { }
class DefaultBooleanBit extends createBitType(BitJuncture, defaultBooleanValue) { }
class DefaultSymbolBit extends createBitType(BitJuncture, defaultSymbolValue) { }

class DefaultSettableStringBit extends createBitType(SettableStringBitJuncture, defaultStringValue) { }
class DefaultSettableNumberBit extends createBitType(SettableNumberBitJuncture, defaultNumberValue) { }
class DefaultSettableBooleanBit extends createBitType(SettableBooleanBitJuncture, defaultBooleanValue) { }
class DefaultSettableSymbolBit extends createBitType(SettableSymbolBitJuncture, defaultSymbolValue) { }

interface BitBuilder {
  readonly String: StringBitType;
  readonly Number: NumberBitType;
  readonly Boolean: BooleanBitType;
  readonly Symbol: SymbolBitType;
  readonly Of: {
    (defaultValue: string): StringBitType;
    (defaultValue: number): NumberBitType;
    (defaultValue: boolean): BooleanBitType;
    (defaultValue: symbol): SymbolBitType;
    <V>(defaultValue: V): BitType<V>;
  };

  readonly settable: {
    readonly String: SettableStringBitType;
    readonly Number: SettableNumberBitType;
    readonly Boolean: SettableBooleanBitType;
    readonly Symbol: SettableSymbolBitType;
    readonly Of: {
      (defaultValue: string): SettableStringBitType;
      (defaultValue: number): SettableNumberBitType;
      (defaultValue: boolean): SettableBooleanBitType;
      (defaultValue: symbol): SettableSymbolBitType;
      <V>(defaultValue: V): SettableBitType<V>;
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

    return createBitType(BitJuncture, defaultValue) as any;
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
      let Type: any;
      switch (type) {
        case 'string':
          Type = SettableStringBitJuncture;
          break;
        case 'number':
          Type = SettableNumberBitJuncture;
          break;
        case 'boolean':
          Type = SettableBooleanBitJuncture;
          break;
        case 'symbol':
          Type = SettableSymbolBitJuncture;
          break;
        default:
          Type = SettableBitJuncture;
          break;
      }
      return createBitType(Type, defaultValue);
    }
  }
};
// #endregion
