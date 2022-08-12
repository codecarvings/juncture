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
import { ControlledGear, Gear, GearLayout, GearMediator, GearMountStatus } from '../engine/gear';
import { PathFragment } from '../engine/path';
import { ForgeableJuncture } from '../forgeable-juncture';
import { Forger } from '../forger';
import { JMachineGearMediator } from '../j-machine';
import {
    CursorOfType,
    Juncture, JunctureType, SchemaOf, ValueOfType
} from '../juncture';
import { jSymbols } from '../symbols';

// #region Value & Schema
export type ListValue<JT extends JunctureType> = ReadonlyArray<ValueOfType<JT>>;

export class ListSchema<JT extends JunctureType = any> extends JunctureSchema<ListValue<JT>> {
  protected constructor(readonly Child: JT, defaultValue?: ListValue<JT>) {
    super(defaultValue !== undefined ? defaultValue : []);
  }
}

function createListSchema<JT extends JunctureType>(
  Child: JT,
  defaultValue?: ListValue<JT>
): ListSchema<JT> {
  return new (ListSchema as any)(Child, defaultValue);
}
// #endregion

// #region Forger
export class ListForger<J extends ListJuncture> extends Forger<J> {
}
// #endregion

// #region Engine
export class ListGear extends Gear {
  readonly schema!: ListSchema;

  // #region Value stuff
  readonly _value!: any[];

  protected valueDidUpdate(): void {
    this.reconcileChildren();
    this.children.forEach(child => {
      if (child.gear.mountStatus === GearMountStatus.mounted) {
        child.gear.detectValueChange();
      }
    });
  }
  // #endregion

  // #region Children stuff
  protected createChild(index: number): ControlledGear {
    const { setValue } = this.gearMediator;
    const layout: GearLayout = {
      parent: this,
      path: [...this.layout.path, index],
      isUnivocal: false,
      isDivergent: true
    };
    const gearMediator: GearMediator = {
      getValue: () => this._value[index],
      setValue: childValue => {
        const newValue = [...this._value];
        newValue[index] = childValue;
        setValue(newValue);
      }
    };

    return this.machineMediator.createControlledGear(this.schema.Child, layout, gearMediator);
  }

  protected createChildren(): ControlledGear[] {
    return this._value.map((_v, index) => this.createChild(index));
  }

  protected readonly children: ControlledGear[] = this.createChildren();

  protected reconcileChildren() {
    const valueLen = this._value.length;
    const childrenLen = this.children.length;

    if (valueLen === childrenLen) {
      return;
    } if (valueLen > childrenLen) {
      this.children.length = valueLen;
      for (let i = childrenLen; i < valueLen; i += 1) {
        this.children[i] = this.createChild(i);
      }
    } else {
      const childToUnmount = this.children.slice(valueLen);
      this.children.length = valueLen;
      childToUnmount.forEach(child => child.scheduleUnmount());
    }
  }

  resolveFragment(fragment: PathFragment): Gear {
    if (typeof fragment === 'number') {
      if (fragment >= 0 && fragment <= this.children.length) {
        return this.children[fragment].gear;
      }
    }
    return super.resolveFragment(fragment);
  }
  // #endregion
}

export type ListCursor<J extends ListJuncture> = Cursor<J> & {
  item(index: number): CursorOfType<ChildOf<J>>;
};

// #endregion

// #region Juncture
export abstract class ListJuncture extends ForgeableJuncture {
  protected [jSymbols.createForger](): ListForger<this> {
    return new ListForger<this>(Juncture.getPropertyAssembler(this));
  }

  [jSymbols.createGear](
    layout: GearLayout,
    gearMediator: GearMediator,
    machineMediator: JMachineGearMediator
  ): ListGear {
    return new ListGear(this, layout, gearMediator, machineMediator);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  [jSymbols.createCursor](gear: ListGear): ListCursor<this> {
    const _: any = createCursor(gear);
    _.item = (index: number) => gear.resolveFragment(index).cursor;
    return _;
  }

  protected readonly FORGE!: ListForger<this>;

  abstract readonly schema: Schema<ListSchema>;

  length = this.FORGE.selector(({ value }) => value().length);
}

// ---  Derivations
export type ChildOf<J extends ListJuncture> = SchemaOf<J>['Child'];
// #endregion

// #region Builder types
// --- Inert
interface List<JT extends JunctureType> extends ListJuncture {
  schema: Schema<ListSchema<JT>>;
}
interface ListType<JT extends JunctureType> extends JunctureType<List<JT>> { }
// #endregion

// #region Builder
function createListType<JT extends abstract new(...args: any) => ListJuncture,
   JT2 extends JunctureType>(BaseType: JT, Child: JT2, defaultValue?: ListValue<JT2>) {
  abstract class List extends BaseType {
    schema = createSchema(() => createListSchema(Child, defaultValue));
  }
  return List;
}

interface ListBuilder {
  Of<JT extends JunctureType>(Child: JT, defaultValue?: ListValue<JT>): ListType<JT>;
}

export const jList: ListBuilder = {
  Of: <JT extends JunctureType>(
    Child: JT,
    defaultValue?: ListValue<JT>
  ) => createListType(ListJuncture, Child, defaultValue) as any
};
// #endregion
