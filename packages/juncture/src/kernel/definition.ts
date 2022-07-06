/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';

export interface Definition<K extends string, P, O> {
  readonly [jSymbols.definitionKind]: K;
  readonly [jSymbols.definitionPayload]: P;
  readonly [jSymbols.definitionOptions]: O;
}

export function createDefinition<K extends string, P, O>(kind: K, payload: P, options: O): Definition<K, P, O> {
  const result: Definition<K, P, O> = {
    [jSymbols.definitionKind]: kind,
    [jSymbols.definitionPayload]: payload,
    [jSymbols.definitionOptions]: options
  };

  return result;
}

export function isDefinition(obj: any, kind?: string): obj is Definition<any, any, any> {
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
