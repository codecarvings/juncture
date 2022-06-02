/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';

export interface DefinitionTag<K extends string = any> {
  readonly [jSymbols.definitionKind]: K;
}

export interface Definition<K extends string = any,
 F extends (...args: any) => any = (...args: any) => any> extends DefinitionTag<K> {
  readonly [jSymbols.definitionFn]: F;
}

export function createDefinition<K extends string, F extends (...args: any) => any>(
  kind: K, fn: F) {
  const result: Definition<K, F> = {
    [jSymbols.definitionKind]: kind,
    [jSymbols.definitionFn]: fn
  };

  return result;
}

export function isDefinition(obj: any, kind?: string): obj is Definition {
  if (typeof obj !== 'object') {
    return false;
  }
  if (obj === null) {
    return false;
  }
  if (typeof obj[jSymbols.definitionFn] !== 'function') {
    return false;
  }
  if (kind !== undefined) {
    if (obj[jSymbols.definitionKind] !== kind) {
      return false;
    }
  }
  return true;
  return obj && obj[jSymbols.definitionKind] !== undefined && typeof obj[jSymbols.definitionFn] === 'function';
}
