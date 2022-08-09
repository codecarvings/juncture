/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchema, Schema } from '../construction/descriptors/schema';
import { Forger } from '../construction/forger';
import { JunctureSchema } from '../construction/schema';
import { createCursor, Cursor } from '../engine/cursor';
import {
  Gear, GearLayout, GearMediator, ManagedGearMap
} from '../engine/gear';
import { PathFragment } from '../engine/path';
import { ForgeableJuncture } from '../forgeable-juncture';
import {
  CursorMapOfJunctureTypeMap, Juncture, JunctureType,
  JunctureTypeMap,
  SchemaOf, ValueOfType
} from '../juncture';
import { defineLazyProperty, mappedAssign } from '../misc/object-helpers';
import { jSymbols } from '../symbols';

// #region Value & Schema
export type StructValue<JTM extends JunctureTypeMap> = {
  readonly [K in keyof JTM]: ValueOfType<JTM[K]>;
};
export type PartialStructValue<JTM extends JunctureTypeMap> = {
  readonly [K in keyof JTM]?: ValueOfType<JTM[K]>;
};

let createStructSchema: <JTM extends JunctureTypeMap>(
  Children: JTM, defaultValue?: PartialStructValue<JTM>)
=> StructSchema<JTM>;

export class StructSchema<JTM extends JunctureTypeMap = any> extends JunctureSchema<StructValue<JTM>> {
  protected constructor(readonly Children: JTM, defaultValue?: PartialStructValue<JTM>) {
    const childKeys = Object.keys(Children);
    const childDefaultValue = mappedAssign(
      { },
      childKeys,
      key => Juncture.getSchema(Children[key]).defaultValue
    );
    const mergedDefaultValue = defaultValue !== undefined ? {
      ...childDefaultValue,
      ...defaultValue
    } : childDefaultValue;
    super(mergedDefaultValue);
    this.childKeys = childKeys;
  }

  readonly childKeys: string[];

  static #staticInit = (() => {
    createStructSchema = <JTM2 extends JunctureTypeMap>(
      Children: JTM2, defaultValue?: PartialStructValue<JTM2>
    ) => new StructSchema<JTM2>(Children, defaultValue);
  })();
}
// #endregion

// #region Forger
export class StructForger<J extends StructJuncture> extends Forger<J> {
}
// #endregion

// #region Engine
export class StructGear extends Gear {
  readonly schema!: StructSchema;

  // #region Value stuff
  protected valueDidUpdate(): void {
    this.schema.childKeys.forEach(key => {
      this.children[key].gear.detectValueChange();
    });
  }

  getHarmonizedValue(value: any): any {
    if (value === this._value) {
      return value;
    }
    return {
      ...this._value,
      ...value
    };
  }
  // #endregion

  // #region Children stuff
  protected createChildren(): ManagedGearMap {
    const { setValue } = this.mediator;
    return mappedAssign(
      {},
      this.schema.childKeys,
      key => {
        let unmount: () => void = undefined!;
        const layout: GearLayout = {
          parent: this,
          path: [...this.layout.path, key],
          isUnivocal: this.layout.isUnivocal,
          isDivergent: false
        };
        const mediator: GearMediator = {
          ...this.mediator,
          enroll: um => { unmount = um; },
          getValue: () => this._value[key],
          setValue: newValue => {
            setValue({
              ...this._value,
              [key]: newValue
            });
          }
        };
        const gear = Juncture.createGear(this.schema.Children[key], layout, mediator);
        return { gear, unmount };
      }
    );
  }

  protected readonly children: ManagedGearMap = this.createChildren();

  resolveFragment(fragment: PathFragment): Gear {
    const result = this.children[fragment as any];
    if (result) {
      return result.gear;
    }
    return super.resolveFragment(fragment);
  }
  // #endregion

  // #region Mount stuff
  protected gearWillUnmount(): void {
    super.gearWillUnmount();
    this.schema.childKeys.forEach(key => this.children[key].unmount());
  }
  // #endregion
}

export type StructCursor<J extends StructJuncture> = Cursor<J> & CursorMapOfJunctureTypeMap<ChildrenOf<J>>;

// #endregion

// #region Juncture
export abstract class StructJuncture extends ForgeableJuncture {
  protected [jSymbols.createForger](): StructForger<this> {
    return new StructForger<this>(Juncture.getPropertyAssembler(this));
  }

  [jSymbols.createGear](layout: GearLayout, mediator: GearMediator): StructGear {
    return new StructGear(this, layout, mediator);
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createCursor](gear: StructGear): StructCursor<this> {
    const _: any = createCursor(gear);
    gear.schema.childKeys.forEach(key => {
      defineLazyProperty(_, key, () => gear.resolveFragment(key).cursor, { enumerable: true });
    });
    return _;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  [jSymbols.createInternalCursor](gear: StructGear): StructCursor<this> {
    return gear.cursor as StructCursor<this>;
  }

  protected readonly FORGE!: StructForger<this>;

  abstract readonly schema: Schema<StructSchema>;
}

// ---  Derivations
export type ChildrenOf<J extends StructJuncture> = SchemaOf<J>['Children'];
// #endregion

// #region Builder types
// --- Inert
interface Struct<JTM extends JunctureTypeMap> extends StructJuncture {
  schema: Schema<StructSchema<JTM>>;
}
interface StructType<JTM extends JunctureTypeMap> extends JunctureType<Struct<JTM>> { }
// #endregion

// #region Builder
function createStructType<JT extends abstract new(...args: any) => StructJuncture,
  JTM extends JunctureTypeMap>(BaseType: JT, Children: JTM, defaultValue?: PartialStructValue<JTM>) {
  abstract class Struct extends BaseType {
    schema = createSchema(() => createStructSchema(Children, defaultValue));
  }
  return Struct;
}

interface StructBuilder {
  of<JTM extends JunctureTypeMap>(Children: JTM, defaultValue?: PartialStructValue<JTM>): StructType<JTM>;
}

export const jStruct: StructBuilder = {
  of: <JTM extends JunctureTypeMap>(
    Children: JTM,
    defaultValue?: PartialStructValue<JTM>
  ) => createStructType(StructJuncture, Children, defaultValue) as any
};
// #endregion
