/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, SchemaOf } from '../juncture';
import { jSymbols } from '../symbols';
import { mappedAssign } from '../util/object';
import { isDefinition, DefinitionKind } from './definition';
import { SelectorsOf } from './selector';

export class Driver<J extends Juncture> {
  readonly schema: SchemaOf<J>;

  readonly selectors: SelectorsOf<J>;

  readonly selectorKeys: ReadonlyArray<string>;

  constructor(protected readonly juncture: J) {
    this.schema = this.juncture.schema[jSymbols.definitionPayload]();

    const junctureKeys = Object.keys(juncture);

    const selectors = this.getSelectors(junctureKeys);
    this.selectors = selectors.map;
    this.selectorKeys = selectors.keys;
  }

  protected getDefinitions(junctureKeys: string[], kind: DefinitionKind): { map: any, keys: string[] } {
    const juncture = this.juncture as any;
    const keys = junctureKeys.filter(key => isDefinition(juncture[key], kind));
    const map = mappedAssign({}, keys, key => juncture[key]);
    return { map, keys };
  }

  protected getSelectors(junctureKeys: string[]) {
    return this.getDefinitions(junctureKeys, DefinitionKind.selector);
  }
}
