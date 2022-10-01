/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DescriptorKeyPrefix } from '../../design/descriptor-type';
import { Dependency } from '../../design/descriptors/dependency';
import { OptDependency } from '../../design/descriptors/opt-dependency';
import { DependencyType } from '../../di/dependency';

type DepsBinItem<L> =
  L extends Dependency<infer B> ? DependencyType<B>
    : L extends OptDependency<infer B> ? DependencyType<B> | undefined
      : never;

export type DepsBin<D> = D extends any ? {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.dependency}.${infer W}` ? W : never] : DepsBinItem<D[K]>;
} : never;
