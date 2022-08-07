/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import { isObject } from '../util/object';

export enum DefType {
  schema = 'schema',
  selector = 'selector',
  reducer = 'reducer',
  reactor = 'reactor'
}

export enum DefAccess {
  public = 'public',
  protected = 'protected',
  private = 'private'
}

// Not a class because of AccessModifier implementation (and because so can be easily expanded...)
export interface Def<T extends DefType, A extends DefAccess, P> {
  readonly type: T;
  readonly access: A;
  readonly [jSymbols.defPayload]: P;
}

// eslint-disable-next-line max-len
export function createDef<T extends DefType, A extends DefAccess, P>(type: T, access: A, payload: P): Def<T, A, P> {
  const result: Def<T, A, P> = {
    type,
    access,
    [jSymbols.defPayload]: payload
  };

  return result;
}

export function isDef<T extends DefType, A extends DefAccess>(obj: any, type?: T, access?: A): obj is Def<T, A, any> {
  if (!isObject(obj)) {
    return false;
  }

  if (type !== undefined) {
    if (obj.type !== type) {
      return false;
    }
  } else if (typeof obj.type !== 'string') {
    return false;
  }

  if (access !== undefined) {
    if (obj.access !== access) {
      return false;
    }
  } else if (typeof obj.access !== 'string') {
    return false;
  }

  return true;
}

export function getFilteredDefKeys(obj: object, type: DefType, internalUse: boolean): string[] {
  return Object.keys(obj).filter(key => {
    const prop = (obj as any)[key];
    if (!isDef(prop, type)) {
      return false;
    }
    if (!internalUse && prop.access !== DefAccess.public) {
      return false;
    }
    return true;
  });
}
