/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';

export enum DefKind {
  schema = 'schema',
  selector = 'selector',
  reducer = 'reducer'
}

export interface Def<K extends DefKind, S extends string, P> {
  readonly defKind: K;
  readonly defSubKind: S;
  readonly [jSymbols.defPayload]: P;
}

export function createDef<K extends DefKind, S extends string, P>(kind: K, subKind: S, payload: P): Def<K, S, P> {
  const result: Def<K, S, P> = {
    defKind: kind,
    defSubKind: subKind,
    [jSymbols.defPayload]: payload
  };

  return result;
}

export function isDef(obj: any, kind?: DefKind, subKind?: string): obj is Def<any, any, any> {
  if (typeof obj !== 'object') {
    return false;
  }
  if (obj === null) {
    return false;
  }

  if (kind !== undefined) {
    if (obj.defKind !== kind) {
      return false;
    }
  } else if (typeof obj.defKind !== 'string') {
    return false;
  }

  if (subKind !== undefined) {
    if (obj.defSubKind !== subKind) {
      return false;
    }
  } else if (typeof obj.defSubKind !== 'string') {
    return false;
  }

  return true;
}
