/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import { isObject } from '../util/object';
import { isPrivate } from './private';

export enum DefKind {
  schema = 'schema',
  selector = 'selector',
  reducer = 'reducer'
}

// Not a class because of Private implementation (and because so can be easily expanded...)
export interface Def<K extends DefKind, Q extends string, P> {
  readonly defKind: K;
  readonly defSubKind: Q;
  readonly [jSymbols.defPayload]: P;
}

export function createDef<K extends DefKind, Q extends string, P>(kind: K, subKind: Q, payload: P): Def<K, Q, P> {
  const result: Def<K, Q, P> = {
    defKind: kind,
    defSubKind: subKind,
    [jSymbols.defPayload]: payload
  };

  return result;
}

export function isDef(obj: any, kind?: DefKind, subKind?: string): obj is Def<any, any, any> {
  if (!isObject(obj)) {
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

export function getFilteredDefKeys(obj: object, privateUse: boolean, kind: DefKind, subKind?: string): string[] {
  return Object.keys(obj).filter(key => {
    const prop = (obj as any)[key];
    if (!isDef(prop, kind, subKind)) {
      return false;
    }
    if (!privateUse && isPrivate(prop)) {
      return false;
    }
    return true;
  });
}
