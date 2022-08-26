/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  AccessModifier, Private, PrivateJuncture
} from '../access';
import { createSchema, Schema } from '../design/descriptors/schema';
import { SingleChildSchema } from '../design/schema';
import { SchemaOf } from '../driver';
import { createCursor, Cursor } from '../engine/frame-equipment/cursor';
import { Gear, GearLayout, GearMediator } from '../engine/gear';
import { PathFragment } from '../engine/path';
import { ForgeableDriver } from '../forgeable-driver';
import { Forger } from '../forger';
import { JMachineGearMediator } from '../j-machine';
import { AlterablePartialJuncture, Juncture, OuterCursorOfJuncture, ValueOfJuncture } from '../juncture';
import { jSymbols } from '../symbols';
import { defineLazyProperty } from '../tool/object';

// #region Value & Schema
export type FacadeValue<J extends PrivateJuncture> = ValueOfJuncture<J>;

export class FacadeSchema<J extends PrivateJuncture = any> extends SingleChildSchema<J, FacadeValue<J>> {
  protected constructor(Child: J, defaultValue?: FacadeValue<J>) {
    super(Child, defaultValue !== undefined ? defaultValue : Juncture.getSchema(Child).defaultValue);
  }
}

function createFacadeSchema<J extends PrivateJuncture>(
  Child: J,
  defaultValue?: FacadeValue<J>
): FacadeSchema<J> {
  return new (FacadeSchema as any)(Child, defaultValue);
}
// #endregion

// #region Forger
export class FacadeForger<D extends FacadeDriver> extends Forger<D> {
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

export type FacadeCursor<D extends FacadeDriver> = Cursor<D> & {
  readonly inner: OuterCursorOfJuncture<ChildOf<D>>;
};

// #endregion

// #region Driver
export abstract class FacadeDriver extends ForgeableDriver {
  protected [jSymbols.createForger](): FacadeForger<this> {
    return new FacadeForger(this);
  }

  [jSymbols.createGear](
    layout: GearLayout,
    gearMediator: GearMediator,
    machineMediator: JMachineGearMediator
  ): FacadeGear {
    return new FacadeGear(this, layout, gearMediator, machineMediator);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  [jSymbols.createCursor](gear: FacadeGear): FacadeCursor<this> {
    const _: any = createCursor(gear);
    defineLazyProperty(_, childKey, () => gear.resolveFragment(childKey).outerCursor, { enumerable: true });
    return _;
  }

  protected readonly FORGE!: FacadeForger<this>;

  abstract readonly schema: Schema<FacadeSchema>;
}

// ---  Derivations
export type ChildOf<D extends FacadeDriver> = SchemaOf<D>['Child'];
// #endregion

// #region Juncture
// --- Inert
interface Facade<J extends PrivateJuncture> extends FacadeDriver {
  schema: Schema<FacadeSchema<J>>;
}
interface FacadeJuncture<J extends PrivateJuncture> extends Juncture<Facade<J>> { }
// #endregion

// #region Builder
function createFacadeJuncture<J extends AlterablePartialJuncture<FacadeDriver>,
  J2 extends PrivateJuncture>(BaseJuncture: J, Child: J2, defaultValue?: FacadeValue<J2>) {
  abstract class Facade extends BaseJuncture {
    schema = createSchema(() => createFacadeSchema(Child, defaultValue));
  }
  return Facade;
}

interface FacadeJunctureBuilder {
  Of<J extends PrivateJuncture>(Child: J, defaultValue?: FacadeValue<J>): FacadeJuncture<J>;
  Of<J extends Juncture>(Child: J, defaultValue?: FacadeValue<Private<J>>): FacadeJuncture<Private<J>>;
}

export const $Facade: FacadeJunctureBuilder = {
  Of: <J extends PrivateJuncture>(
    Child: J,
    defaultValue?: FacadeValue<J>
  ) => {
    let ChildJuncture: PrivateJuncture;
    switch ((Child as any).access) {
      case AccessModifier.private:
        ChildJuncture = Child;
        break;
      default:
        ChildJuncture = Private(Child);
        break;
    }
    return createFacadeJuncture(FacadeDriver, ChildJuncture, defaultValue) as any;
  }
};
// #endregion
