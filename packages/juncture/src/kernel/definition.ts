/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';

export interface Definition<K extends string, P> {
  readonly [jSymbols.definitionKind]: K;
  readonly [jSymbols.definitionPayload]: P;
}

export function createDefinition<K extends string, P>(kind: K, payload: P): Definition<K, P> {
  const result: Definition<K, P> = {
    [jSymbols.definitionKind]: kind,
    [jSymbols.definitionPayload]: payload
  };

  return result;
}

export function isDefinition(obj: any, kind?: string): obj is Definition<any, any> {
  if (typeof obj !== 'object') {
    return false;
  }
  if (obj === null) {
    return false;
  }
  if (kind !== undefined) {
    if (obj[jSymbols.definitionKind] !== kind) {
      return false;
    }
  }
  return true;
}
