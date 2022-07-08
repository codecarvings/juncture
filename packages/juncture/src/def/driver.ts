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
import { DefKind, isDef } from './def';
import { SelectorDefsOf } from './selector';

export class Driver<J extends Juncture> {
  readonly schema: SchemaOf<J>;

  readonly selectors: SelectorDefsOf<J>;

  readonly selectorKeys: ReadonlyArray<string>;

  constructor(protected readonly juncture: J) {
    this.schema = this.juncture.schema[jSymbols.defPayload]();

    const junctureKeys = Object.keys(juncture);

    const selectors = this.getSelectors(junctureKeys);
    this.selectors = selectors.map;
    this.selectorKeys = selectors.keys;
  }

  protected getDefs(junctureKeys: string[], kind: DefKind): { map: any, keys: string[] } {
    const juncture = this.juncture as any;
    const keys = junctureKeys.filter(key => isDef(juncture[key], kind));
    const map = mappedAssign({}, keys, key => juncture[key]);
    return { map, keys };
  }

  protected getSelectors(junctureKeys: string[]) {
    return this.getDefs(junctureKeys, DefKind.selector);
  }
}
