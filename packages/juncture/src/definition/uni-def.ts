/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';
import {
  Def, DefAccess, DefType, isDef
} from './def';

export interface UniDef<T extends DefType, V extends string, A extends DefAccess, P> extends Def<T, A, P> {
  readonly variety: V;
}

export function createUniDef<T extends DefType, V extends string, A extends DefAccess, P>(
  type: T,
  variety: V,
  access: A,
  payload: P
): UniDef<T, V, A, P> {
  const result: UniDef<T, V, A, P> = {
    type,
    variety,
    access,
    [jSymbols.defPayload]: payload
  };

  return result;
}

// eslint-disable-next-line max-len
export function isUniDef<T extends DefType, V extends string, A extends DefAccess>(
  obj: any,
  type?: T,
  variety?: V,
  access?: A
): obj is UniDef<T, V, A, any> {
  if (!isDef(obj, type, access)) {
    return false;
  }

  if (variety !== undefined) {
    if ((obj as any).variety !== variety) {
      return false;
    }
  } else if (typeof (obj as any).variety !== 'string') {
    return false;
  }

  return true;
}