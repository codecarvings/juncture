/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Path } from './path';

export interface Action {
  readonly target: Path;
  readonly key: string;
  readonly args: any;
  readonly callback?: () => void;
}

export function createAction(target: Path, key: string, args: any): Action {
  return { target, key, args };
}

export interface Dispatcher {
  dispatch(action: Action): void;
}
