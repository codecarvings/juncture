/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';

export enum DefinitionKind {
  schema = 'schema',
  selector = 'selector',
  reducer = 'reducer'
}

export interface Definition<K extends DefinitionKind, P> {
  readonly definitionKind: K;
  readonly [jSymbols.definitionPayload]: P;
}

export function createDefinition<K extends DefinitionKind, P>(kind: K, payload: P): Definition<K, P> {
  const result: Definition<K, P> = {
    definitionKind: kind,
    [jSymbols.definitionPayload]: payload
  };

  return result;
}

export function isDefinition(obj: any, kind?: DefinitionKind): obj is Definition<any, any> {
  if (typeof obj !== 'object') {
    return false;
  }
  if (obj === null) {
    return false;
  }
  if (kind !== undefined) {
    if (obj.definitionKind !== kind) {
      return false;
    }
  } else if (typeof obj.definitionKind !== 'string') {
    return false;
  }
  return true;
}

export interface IntegratedDefinition<K extends DefinitionKind, T extends string, P>
  extends Definition<K, P> {
  readonly definitionSubKind: T;
}

export function createIntegratedDefinition
  <K extends DefinitionKind, T extends string, P>(kind: K, subKind: T, payload: P): IntegratedDefinition<K, T, P> {
  const result: any = createDefinition(kind, payload);
  result.definitionSubKind = subKind;
  return result;
}

export function isIntegratedDefinition(obj: any, kind?: DefinitionKind, subKind?: string):
  obj is IntegratedDefinition<any, any, any> {
  if (!isDefinition(obj, kind)) {
    return false;
  }
  if (subKind !== undefined) {
    if ((obj as any).definitionSubKind !== subKind) {
      return false;
    }
  } else if (typeof (obj as any).definitionSubKind !== 'string') {
    return false;
  }
  return true;
}
