/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchema, Schema } from '../design/descriptors/schema';
import { JunctureSchema } from '../design/schema';
import { createCursor, Cursor } from '../engine/cursor';
import {
  Gear, GearLayout, GearMap, GearMediator
} from '../engine/gear';
import { PathFragment } from '../engine/path';
import { ForgeableJuncture } from '../forgeable-juncture';
import { Forger } from '../forger';
import { JMachineGearMediator } from '../j-machine';
import {
  CursorMapOfJunctureTypeMap, Juncture, JunctureType,
  JunctureTypeMap,
  SchemaOf, ValueOfType
} from '../juncture';
import { jSymbols } from '../symbols';
import { defineLazyProperty, mappedAssign } from '../tool/object';

// #region Value & Schema
export type StructValue<JTM extends JunctureTypeMap> = {
  readonly [K in keyof JTM]: ValueOfType<JTM[K]>;
};
export type PartialStructValue<JTM extends JunctureTypeMap> = {
  readonly [K in keyof JTM]?: ValueOfType<JTM[K]>;
};
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
}

function createStructSchema<JTM extends JunctureTypeMap>(
  Children: JTM,
  defaultValue?: PartialStructValue<JTM>
): StructSchema<JTM> {
  return new (StructSchema as any)(Children, defaultValue);
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
      this.children[key].detectValueChange();
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
  protected createChildren(): GearMap {
    const { setValue } = this.gearMediator;
    return mappedAssign(
      {},
      this.schema.childKeys,
      key => {
        const layout: GearLayout = {
          parent: this,
          path: [...this.layout.path, key],
          isUnivocal: this.layout.isUnivocal,
          isDivergent: false
        };
        const gearMediator: GearMediator = {
          getValue: () => this._value[key],
          setValue: childValue => {
            setValue({
              ...this._value,
              [key]: childValue
            });
          }
        };
        return Juncture.createGear(this.schema.Children[key], layout, gearMediator, this.machineMediator);
      }
    );
  }

  protected readonly children: GearMap = this.createChildren();

  resolveFragment(fragment: PathFragment): Gear {
    const result = this.children[fragment as any];
    if (result) {
      return result;
    }
    return super.resolveFragment(fragment);
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

  [jSymbols.createGear](
    layout: GearLayout,
    mediator: GearMediator,
    machineMediator: JMachineGearMediator
  ): StructGear {
    return new StructGear(this, layout, mediator, machineMediator);
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
  Of<JTM extends JunctureTypeMap>(Children: JTM, defaultValue?: PartialStructValue<JTM>): StructType<JTM>;
}

export const jStruct: StructBuilder = {
  Of: <JTM extends JunctureTypeMap>(
    Children: JTM,
    defaultValue?: PartialStructValue<JTM>
  ) => createStructType(StructJuncture, Children, defaultValue) as any
};
// #endregion
