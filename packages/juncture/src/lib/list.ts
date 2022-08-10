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
  Gear, GearController, GearLayout, GearMediator, ManagedGear
} from '../engine/gear';
import { PathFragment } from '../engine/path';
import { ForgeableJuncture } from '../forgeable-juncture';
import { Forger } from '../forger';
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

  constructor(juncture: Juncture, layout: GearLayout, mediator: GearMediator) {
    super(juncture, layout, mediator);
    this.reconcileChildren();
  }

  // #region Value stuff
  protected valueDidUpdate(): void {
    this.reconcileChildren();
    this.children.forEach(child => child.gear.detectValueChange());
  }
  // #endregion

  // #region Children stuff
  protected createChild(index: number): ManagedGear {
    const { setValue } = this.mediator;
    const layout: GearLayout = {
      parent: this,
      path: [...this.layout.path, index],
      isUnivocal: this.layout.isUnivocal,
      isDivergent: false
    };
    let controller: GearController = undefined!;
    const mediator: GearMediator = {
      ...this.mediator,
      enroll: c => { controller = c; },
      getValue: () => this._value[index],
      setValue: childValue => {
        const newValue = [...this._value];
        newValue[index] = childValue;
        setValue(newValue);
      }
    };
    const gear = Juncture.createGear(this.schema.Child, layout, mediator);
    return { gear, controller };
  }

  protected readonly children: ManagedGear[] = [];

  protected reconcileChildren() {
    const valueLen = this._value.length;
    const childrenLen = this.children.length;

    if (valueLen === childrenLen) {
      return;
    } if (valueLen > childrenLen) {
      this.children.length = valueLen;
      for (let i = childrenLen; i < valueLen; i += 1) {
        this.children[i] = this.createChild(i);
        if (this._isMounted) {
          this.children[i].controller.mount();
        }
      }
    } else {
      for (let i = valueLen; i < childrenLen; i += 1) {
        this.children[i].controller.unmount();
      }
      this.children.length = valueLen;
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

  // #region Mount stuff
  protected gearDidMount(): void {
    super.gearDidMount();
    this.children.forEach(child => child.controller.mount());
  }

  protected gearWillUnmount(): void {
    super.gearWillUnmount();
    this.children.forEach(child => child.controller.unmount());
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

  [jSymbols.createGear](layout: GearLayout, mediator: GearMediator): ListGear {
    return new ListGear(this, layout, mediator);
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
