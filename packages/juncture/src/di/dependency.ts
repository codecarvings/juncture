/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isJuncture, Juncture, XpCursorOf } from '../juncture';
import { Constructable } from '../utilities/constructable';
import { InjectionToken } from './injection-token';

export type DependencyKey = Juncture | InjectionToken | Constructable;

export type DependencyType<K extends DependencyKey> =
  K extends Juncture ? XpCursorOf<K> :
    K extends InjectionToken<infer T> ? T :
      K extends Constructable ? InstanceType<K> :
        never;

export function dependencyKeyToString(key: DependencyKey): string {
  if (isJuncture(key)) {
    return `juncture:${key.name}`;
  }
  if (key instanceof InjectionToken) {
    return key.toString();
  }
  return `constructor:${key.name}`;
}
