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
let createBitSchema: <V>(defaultValue: V) => BitSchema<V>;
export class BitSchema<V = any> extends Schema<V> {
  protected constructor(defaultValue: V) {
    super(defaultValue);
  }

  // Initialization without static block
  static #staticInit = (() => {
    createBitSchema = <V2>(defaultValue: V2) => new BitSchema<V2>(defaultValue);
  })();
}
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
function createBitType<JT extends abstract new(...args: any) => Bit>(type: JT, defaultValue: any): any {
  // (not abstract, required by mixin...)
  abstract class StatedBit extends type {
    schema = createSchemaDef(() => createBitSchema(defaultValue));
  }
  return StatedBit;
}

// --- Inert
interface ABit<V> extends Bit {
  schema: SchemaDef<BitSchema<V>>;
}
type ABitType<V> = JunctureType<ABit<V>>;

interface AStringBit extends ABit<string> { }
type AStringBitType = JunctureType<AStringBit>;

interface ANumberBit extends ABit<number> { }
type ANumberBitType = JunctureType<ANumberBit>;

interface ABooleanBit extends ABit<boolean> { }
type ABooleanBitType = JunctureType<ABooleanBit>;

interface ASymbolBit extends ABit<symbol> { }
type ASymbolBitType = JunctureType<ASymbolBit>;

// --- Settable
interface ASettableBit<V> extends SettableBit {
  schema: SchemaDef<BitSchema<V>>;
}
type ASettableBitType<V> = JunctureType<ASettableBit<V>>;

interface ASettableStringBit extends SettableStringBit {
  schema: SchemaDef<BitSchema<string>>;
}
type ASettableStringBitType = JunctureType<ASettableStringBit>;

interface ASettableNumberBit extends SettableNumberBit {
  schema: SchemaDef<BitSchema<number>>;
}
type ASettableNumberBitType = JunctureType<ASettableNumberBit>;

interface ASettableBooleanBit extends SettableBooleanBit {
  schema: SchemaDef<BitSchema<boolean>>;
}
type ASettableBooleanBitType = JunctureType<ASettableBooleanBit>;

interface ASettableSymbolBit extends SettableBit {
  schema: SchemaDef<BitSchema<symbol>>;
}
type ASettableSymbolBitType = JunctureType<ASettableSymbolBit>;
// #endregion

// #region Builder
const DefaultStringBit = createBitType(Bit, '');
const DefaultNumberBit = createBitType(Bit, 0);
const DefaultBooleanBit = createBitType(Bit, false);
const DefaultSymbolBit = createBitType(Bit, jSymbols.bitDefault);

const DefaultSettableStringBit = createBitType(SettableStringBit, '');
const DefaultSettableNumberBit = createBitType(SettableNumberBit, 0);
const DefaultSettableBooleanBit = createBitType(SettableBooleanBit, false);
const DefaultSettableSymbolBit = createBitType(SettableBit, jSymbols.bitDefault);

interface BitBuilder {
  readonly string: AStringBitType;
  readonly number: ANumberBitType;
  readonly boolean: ABooleanBitType;
  readonly symbol: ASymbolBitType;
  readonly of: {
    (defaultValue: string): AStringBitType;
    (defaultValue: number): ANumberBitType;
    (defaultValue: boolean): ABooleanBitType;
    (defaultValue: symbol): ASymbolBitType;
    <V>(defaultValue: V): ABitType<V>;
  };

  readonly settable: {
    readonly string: ASettableStringBitType;
    readonly number: ASettableNumberBitType;
    readonly boolean: ASettableBooleanBitType;
    readonly symbol: ASettableSymbolBitType;
    readonly of: {
      (defaultValue: string): ASettableStringBitType;
      (defaultValue: number): ASettableNumberBitType;
      (defaultValue: boolean): ASettableBooleanBitType;
      (defaultValue: symbol): ASettableSymbolBitType;
      <V>(defaultValue: V): ASettableBitType<V>;
    }
  }
}

export const bit: BitBuilder = {
  string: DefaultStringBit,
  number: DefaultNumberBit,
  boolean: DefaultBooleanBit,
  symbol: DefaultSymbolBit,
  of: <V>(defaultValue: V) => createBitType(Bit, defaultValue),

  settable: {
    string: DefaultSettableStringBit,
    number: DefaultSettableNumberBit,
    boolean: DefaultSettableBooleanBit,
    symbol: DefaultSettableSymbolBit,
    of: <V>(defaultValue: V) => {
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
