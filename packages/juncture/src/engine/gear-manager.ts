/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Gear, ManagedGear
} from './gear';
import { pathToString } from './path';

interface GearSnapshot {
  readonly managedGear: ManagedGear;
  readonly children: Gear[];
}

export class GearManager {
  constructor() {
    this.enrollGear = this.enrollGear.bind(this);
  }

  protected gearsToMount = new Map<Gear, GearSnapshot>();

  protected gearsToUnmount: Gear[] = [];

  protected mountedGears = new Map<Gear, GearSnapshot>();

  protected syncRequired = false;

  enrollGear(managedGear: ManagedGear) {
    if (this.mountedGears.has(managedGear.gear) || this.gearsToMount.has(managedGear.gear)) {
      // eslint-disable-next-line max-len
      throw Error(`Gear manager cannot enroll gear ${pathToString(managedGear.gear.layout.path)}: already been enrolled`);
    }

    const { parent } = managedGear.gear.layout;
    if (parent) {
      let parentSnapshot = this.mountedGears.get(parent);
      if (parentSnapshot) {
        parentSnapshot.children.push(managedGear.gear);
      } else {
        parentSnapshot = this.gearsToMount.get(parent);
        if (parentSnapshot) {
          parentSnapshot.children.push(managedGear.gear);
        } else {
          // eslint-disable-next-line max-len
          throw Error(`Gear manager cannot enroll gear ${pathToString(managedGear.gear.layout.path)}: cannot find parent gear ${pathToString(parent.layout.path)} `);
        }
      }
    }

    this.gearsToMount.set(managedGear.gear, {
      managedGear,
      children: []
    });

    this.syncRequired = true;
  }

  dismissGear(gear: Gear) {
    if (!this.mountedGears.has(gear)) {
      if (this.gearsToMount.has(gear)) {
        throw Error(`Gear manager cannot unmount gear ${pathToString(gear.layout.path)}: not yet mounted`);
      } else {
        throw Error(`Gear manager cannot unmount gear ${pathToString(gear.layout.path)}: not found`);
      }
    }

    this.gearsToUnmount.push(gear);
    this.syncRequired = true;
  }

  sync() {
    if (!this.syncRequired) {
      return;
    }

    if (this.gearsToUnmount.length > 0) {
      const allManagedGears: ManagedGear[] = [];
      const iterateGears = (gears: Gear[]) => {
        gears.forEach(gear => {
          const snapshot = this.mountedGears.get(gear)!;
          allManagedGears.push(snapshot.managedGear);
          iterateGears(snapshot.children);
        });
      };
      iterateGears(this.gearsToUnmount);

      allManagedGears.forEach(managedGear => {
        this.mountedGears.delete(managedGear.gear);
      });
      allManagedGears.forEach(managedGear => {
        managedGear.unmount();
      });

      this.gearsToUnmount.length = 0;
    }

    if (this.gearsToMount.size > 0) {
      this.gearsToMount.forEach(snapshot => {
        snapshot.managedGear.mount();
      });
      this.gearsToMount.forEach(snapshot => {
        this.mountedGears.set(snapshot.managedGear.gear, snapshot);
      });

      this.gearsToMount.clear();
    }

    this.syncRequired = false;
  }
}
