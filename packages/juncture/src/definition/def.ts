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
  schema = 'scm',
  selector = 'sel',
  paramSelector = 'psl',
  reducer = 'red',
  trigger = 'trg',
  reactor = 'rea'
}

export enum DefAccess {
  public = 'pub',
  protected = 'prt',
  private = 'prv'
}

export type NotSuitableDefType = '\u26A0 ERROR: NOT SUITABLE TYPE';

// Not a class because of AccessModifier implementation (and because so can be easily expanded...)
export interface Def<T extends DefType, P, A extends DefAccess> {
  readonly type: T;
  readonly [jSymbols.defPayload]: P;
  readonly access: A;
}

// eslint-disable-next-line max-len
export function createDef<T extends DefType, P, A extends DefAccess>(type: T, payload: P, access: A): Def<T, P, A> {
  const result: Def<T, P, A> = {
    type,
    [jSymbols.defPayload]: payload,
    access
  };

  return result;
}

export function isDef(obj: any): obj is Def<any, any, any> {
  if (!isObject(obj)) {
    return false;
  }

  if (typeof obj.type !== 'string') {
    return false;
  }

  if (typeof obj.access !== 'string') {
    return false;
  }

  return true;
}

export function getFilteredDefKeys(obj: object, types: DefType[], internalUse: boolean): string[] {
  return Object.keys(obj).filter(key => {
    const prop = (obj as any)[key];
    if (!isDef(prop)) {
      return false;
    }
    if (types.indexOf(prop.type) === -1) {
      return false;
    }

    if (!internalUse && prop.access !== DefAccess.public) {
      return false;
    }
    return true;
  });
}
