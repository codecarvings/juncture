/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefComposer } from '../definition/composer';
import { createSchemaDef, Schema, SchemaDef } from '../definition/schema';
import { Juncture, JunctureType } from '../juncture';
import { ValueOf } from '../schema-host';
import { jSymbols } from '../symbols';

// #region Value & Schema
export class BitSchema<V = any> extends Schema<V> { }
// #endregion

// #region Composer
export class BitDefComposer<J extends Bit> extends DefComposer<J> {
  protected createOverrideMannequin() {
    return {
      ...super.createOverrideMannequin()
    };
  }

  readonly override!: DefComposer<J>['override'] & {
    <D extends SchemaDef<BitSchema<any>>>(parent: D): 'BIT SCHEMA';
  };
}
// #endregion

// #region Juncture
export abstract class Bit extends Juncture {
  abstract readonly schema: SchemaDef<BitSchema>;

  protected [jSymbols.createDefComposer]() {
    return new BitDefComposer(this);
  }

  protected readonly DEF!: BitDefComposer<this>;
}
// #endregion

// #region Specializations
export abstract class SettableBit extends Bit {
  reset = this.DEF.reducer(({ select }) => () => select().defaultValue);

  set = this.DEF.reducer(() => (value: ValueOf<this>) => value);
}

export abstract class SettableStringBit extends SettableBit {
  abstract schema: SchemaDef<BitSchema<string>>;
}

export abstract class SettableNumberBit extends SettableBit {
  abstract schema: SchemaDef<BitSchema<number>>;

  add = this.DEF.reducer(({ value }) => (num: number) => value() + num);

  inc = this.DEF.reducer(({ value }) => () => value() + 1);

  dec = this.DEF.reducer(({ value }) => () => value() - 1);
}

export abstract class SettableBooleanBit extends SettableBit {
  abstract schema: SchemaDef<BitSchema<boolean>>;

  switch = this.DEF.reducer(({ value }) => () => !value());
}
// #endregion

// #region Builder types
// --- Inert
interface StatedBit<V> extends Bit {
  schema: SchemaDef<BitSchema<V>>;
}
interface StatedBitType<V> extends JunctureType<StatedBit<V>> { }

interface StatedStringBit extends StatedBit<string> { }
interface StatedStringBitType extends JunctureType<StatedStringBit> { }

interface StatedNumberBit extends StatedBit<number> { }
interface StatedNumberBitType extends JunctureType<StatedNumberBit> { }

interface StatedBooleanBit extends StatedBit<boolean> { }
interface StatedBooleanBitType extends JunctureType<StatedBooleanBit> { }

interface StatedSymbolBit extends StatedBit<symbol> { }
interface StatedSymbolBitType extends JunctureType<StatedSymbolBit> { }

// --- Settable
interface StatedSettableBit<V> extends SettableBit {
  schema: SchemaDef<BitSchema<V>>;
}
interface StatedSettableBitType<V> extends JunctureType<StatedSettableBit<V>> { }

interface StatedSettableStringBit extends SettableStringBit {
  schema: SchemaDef<BitSchema<string>>;
}
interface StatedSettableStringBitType extends JunctureType<StatedSettableStringBit> { }

interface StatedSettableNumberBit extends SettableNumberBit {
  schema: SchemaDef<BitSchema<number>>;
}
interface StatedSettableNumberBitType extends JunctureType<StatedSettableNumberBit> { }

interface StatedSettableBooleanBit extends SettableBooleanBit {
  schema: SchemaDef<BitSchema<boolean>>;
}
interface StatedSettableBooleanBitType extends JunctureType<StatedSettableBooleanBit> { }

interface StatedSettableSymbolBit extends SettableBit {
  schema: SchemaDef<BitSchema<symbol>>;
}
interface StatedSettableSymbolBitType extends JunctureType<StatedSettableSymbolBit> { }
// #endregion

// #region Builder
function createBitType<JT extends abstract new(...args: any) => Bit>(Type: JT, defaultValue: any) {
  abstract class BuiltBit extends Type {
    schema = createSchemaDef(() => new BitSchema(defaultValue));
  }
  return BuiltBit;
}

class DefaultStringBit extends createBitType(Bit, '') { }
class DefaultNumberBit extends createBitType(Bit, 0) { }
class DefaultBooleanBit extends createBitType(Bit, false) { }
class DefaultSymbolBit extends createBitType(Bit, jSymbols.bitDefault) { }

class DefaultSettableStringBit extends createBitType(SettableStringBit, '') { }
class DefaultSettableNumberBit extends createBitType(SettableNumberBit, 0) { }
class DefaultSettableBooleanBit extends createBitType(SettableBooleanBit, false) { }
class DefaultSettableSymbolBit extends createBitType(SettableBit, jSymbols.bitDefault) { }

interface BitBuilder {
  readonly String: StatedStringBitType;
  readonly Number: StatedNumberBitType;
  readonly Boolean: StatedBooleanBitType;
  readonly Symbol: StatedSymbolBitType;
  readonly Of: {
    (defaultValue: string): StatedStringBitType;
    (defaultValue: number): StatedNumberBitType;
    (defaultValue: boolean): StatedBooleanBitType;
    (defaultValue: symbol): StatedSymbolBitType;
    <V>(defaultValue: V): StatedBitType<V>;
  };

  readonly settable: {
    readonly String: StatedSettableStringBitType;
    readonly Number: StatedSettableNumberBitType;
    readonly Boolean: StatedSettableBooleanBitType;
    readonly Symbol: StatedSettableSymbolBitType;
    readonly Of: {
      (defaultValue: string): StatedSettableStringBitType;
      (defaultValue: number): StatedSettableNumberBitType;
      (defaultValue: boolean): StatedSettableBooleanBitType;
      (defaultValue: symbol): StatedSettableSymbolBitType;
      <V>(defaultValue: V): StatedSettableBitType<V>;
    }
  }
}

export const jBit: BitBuilder = {
  String: DefaultStringBit,
  Number: DefaultNumberBit,
  Boolean: DefaultBooleanBit,
  Symbol: DefaultSymbolBit,
  Of: <V>(defaultValue: V) => createBitType(Bit, defaultValue) as any,

  settable: {
    String: DefaultSettableStringBit,
    Number: DefaultSettableNumberBit,
    Boolean: DefaultSettableBooleanBit,
    Symbol: DefaultSettableSymbolBit,
    Of: <V>(defaultValue: V) => {
      const type = typeof defaultValue;
      let Type: any;
      switch (type) {
        case 'string':
          Type = SettableStringBit;
          break;
        case 'number':
          Type = SettableNumberBit;
          break;
        case 'boolean':
          Type = SettableBooleanBit;
          break;
        case 'symbol':
          Type = SettableBit;
          break;
        default:
          Type = SettableBit;
          break;
      }
      return createBitType(Type, defaultValue);
    }
  }
};
// #endregion
