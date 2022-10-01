/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CursorOfJuncture, Juncture } from '../juncture';
import { Constructable } from '../utilities/constructable';
import { InjectionToken } from './injection-token';

export type DependencyKey = Juncture | Constructable | InjectionToken;

export type DependencyType<K extends DependencyKey> =
  K extends Juncture ? CursorOfJuncture<K> :
    K extends Constructable ? InstanceType<K> :
      K extends InjectionToken<infer T> ? T :
        never;
