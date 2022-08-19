/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSchema, Schema } from '../design/descriptors/schema';
import { JunctureSchema } from '../design/schema';
import { createCursor, Cursor } from '../engine/equipment/cursor';
import { Gear, GearLayout, GearMediator } from '../engine/gear';
import { PathFragment } from '../engine/path';
import { ForgeableJuncture } from '../forgeable-juncture';
import { Forger } from '../forger';
import { JMachineGearMediator } from '../j-machine';
import {
  CursorOfCtor, Juncture, JunctureCtor, SchemaOf, ValueOfCtor
} from '../juncture';
import { jSymbols } from '../symbols';
import { defineLazyProperty } from '../tool/object';

// #region Value & Schema
export type FacadeValue<JT extends JunctureCtor> = ValueOfCtor<JT>;

export class FacadeSchema<JT extends JunctureCtor = any> extends JunctureSchema<FacadeValue<JT>> {
  protected constructor(readonly Child: JT, defaultValue?: FacadeValue<JT>) {
    super(defaultValue !== undefined ? defaultValue : Juncture.getSchema(Child).defaultValue);
  }
}

function createFacadeSchema <JT extends JunctureCtor>(Child: JT, defaultValue?: FacadeValue<JT>): FacadeSchema<JT> {
  return new (FacadeSchema as any)(Child, defaultValue);
}
// #endregion

// #region Forger
export class FacadeForger<J extends FacadeJuncture> extends Forger<J> {
}
// #endregion

// #region Engine
const childKey = 'inner';

export class FacadeGear extends Gear {
  readonly schema!: FacadeSchema;

  // #region Value stuff
  protected valueDidUpdate() {
    this.child.detectValueChange();
  }
  // #endregion

  // #region Children stuff
  protected createChild(): Gear {
    const layout: GearLayout = {
      parent: this,
      path: [...this.layout.path, childKey],
      isUnivocal: this.layout.isUnivocal,
      isDivergent: false
    };
    const gearMediator: GearMediator = {
      getValue: () => this._value,
      setValue: childValue => {
        this._value = childValue;
        // Not a container...
        this.gearMediator.setValue(this._value);
      }
    };
    return Juncture.createGear(this.schema.Child, layout, gearMediator, this.machineMediator);
  }

  protected readonly child: Gear = this.createChild();

  resolveFragment(fragment: PathFragment): Gear {
    if (fragment === childKey) {
      return this.child;
    }
    return super.resolveFragment(fragment);
  }
  // #endregion
}

export type InternalFacadeCursor<J extends FacadeJuncture> = Cursor<J> & {
  readonly inner: CursorOfCtor<ChildOf<J>>;
};

// #endregion

// #region Juncture
export abstract class FacadeJuncture extends ForgeableJuncture {
  protected [jSymbols.createForger](): FacadeForger<this> {
    return new FacadeForger<this>(Juncture.getPropertyAssembler(this));
  }

  [jSymbols.createGear](
    layout: GearLayout,
    gearMediator: GearMediator,
    machineMediator: JMachineGearMediator
  ): FacadeGear {
    return new FacadeGear(this, layout, gearMediator, machineMediator);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  [jSymbols.createInternalCursor](gear: FacadeGear): InternalFacadeCursor<this> {
    const _: any = createCursor(gear);
    defineLazyProperty(_, childKey, () => gear.resolveFragment(childKey).cursor, { enumerable: true });
    return _;
  }

  protected readonly FORGE!: FacadeForger<this>;

  abstract readonly schema: Schema<FacadeSchema>;
}

// ---  Derivations
export type ChildOf<J extends FacadeJuncture> = SchemaOf<J>['Child'];
// #endregion

// #region Builder types
// --- Inert
interface Facade<JT extends JunctureCtor> extends FacadeJuncture {
  schema: Schema<FacadeSchema<JT>>;
}
interface FacadeCtor<JT extends JunctureCtor> extends JunctureCtor<Facade<JT>> { }
// #endregion

// #region Builder
function createFacadeCtor<JT extends abstract new(...args: any) => FacadeJuncture,
  JT2 extends JunctureCtor>(BaseCtor: JT, Child: JT2, defaultValue?: FacadeValue<JT2>) {
  abstract class Facade extends BaseCtor {
    schema = createSchema(() => createFacadeSchema(Child, defaultValue));
  }
  return Facade;
}

interface FacadeBuilder {
  Of<JT extends JunctureCtor>(Child: JT, defaultValue?: FacadeValue<JT>): FacadeCtor<JT>;
}

export const jFacade: FacadeBuilder = {
  Of: <JT extends JunctureCtor>(
    Child: JT,
    defaultValue?: FacadeValue<JT>
  ) => createFacadeCtor(FacadeJuncture, Child, defaultValue) as any
};
// #endregion