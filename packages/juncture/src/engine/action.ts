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
  readonly payload: any;
  readonly callback?: () => void;
}

export function createAction(target: Path, key: string, payload: any): Action {
  return { target, key, payload };
}

export interface Dispatcher {
  dispatch(action: Action): void;
}
