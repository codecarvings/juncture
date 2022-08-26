/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BodyOfSchema, Schema } from './design/descriptors/schema';
import { createSelector, Selector } from './design/descriptors/selector';
import { JunctureSchema } from './design/schema';
import { createCursor, Cursor } from './engine/frame-equipment/cursor';
import {
  Gear, GearLayout, GearMediator, GearMountStatus
} from './engine/gear';
import { getGear } from './engine/gear-host';
import { Path } from './engine/path';
import { JMachineGearMediator } from './j-machine';
import { Juncture } from './juncture';
import { jSymbols } from './symbols';
import { Initializable } from './tool/initializable';
import { PropertyAssembler, PropertyAssemblerHost } from './tool/property-assembler';

export abstract class Driver implements PropertyAssemblerHost, Initializable {
  // #region Engine methods
  [jSymbols.createPropertyAssembler](): PropertyAssembler {
    return new PropertyAssembler(this);
  }

  [jSymbols.init]() {
    PropertyAssembler.get(this).wire();
  }

  [jSymbols.createGear](layout: GearLayout, gearMediator: GearMediator, machineMediator: JMachineGearMediator): Gear {
    return new Gear(this, layout, gearMediator, machineMediator);
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createCursor](gear: Gear): Cursor<this> {
    // To save memory by detault use the outer cursor only.
    // Derivate Junctures can return the right cursor.
    return gear.outerCursor as Cursor<this>;
  }

  // eslint-disable-next-line class-methods-use-this
  [jSymbols.createOuterCursor](gear: Gear): Cursor<this> {
    return createCursor(gear) as Cursor<this>;
  }
  // #endregion

  constructor() {
    const assembler = PropertyAssembler.get(this);

    this.defaultValue = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getGear(frame._).schema.defaultValue));

    this.path = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getGear(frame._).layout.path));

    this.isMounted = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getGear(frame._).mountStatus === GearMountStatus.mounted));

    this.value = assembler
      .registerStaticProperty(createSelector((
        frame: any
      ) => getGear(frame._).value));

    this.Juncture = assembler
      .registerStaticProperty(createSelector(() => this.constructor as Juncture<this>));
  }

  // #region Descriptors
  abstract readonly schema: Schema<JunctureSchema>;

  readonly defaultValue: Selector<ValueOf<this>>;

  readonly path: Selector<Path>;

  readonly isMounted: Selector<boolean>;

  readonly value: Selector<ValueOf<this>>;

  readonly Juncture: Selector<Juncture<this>>;
  // #endregion
}

// ---  Derivations
export type SchemaOf<D extends Driver> = BodyOfSchema<D['schema']>;
export type ValueOf<D extends Driver> = BodyOfSchema<D['schema']>['defaultValue'];

// Use inference to keep type name
export type CursorOf<D extends Driver> = D extends {
  [jSymbols.createCursor](...args : any) : infer C
} ? C : never;
export type OuterCursorOf<D extends Driver> = D extends {
  [jSymbols.createOuterCursor](...args : any) : infer C
} ? C : never;
