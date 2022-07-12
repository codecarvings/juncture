/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefKind, isDef } from './definition/def';
import { ReducerDefsOf } from './definition/reducer';
import { SelectorDefsOf } from './definition/selector';
import { Juncture, SchemaOf } from './juncture';
import { jSymbols } from './symbols';
import { mappedAssign } from './util/object';

export class Driver<J extends Juncture> {
  readonly schema: SchemaOf<J>;

  readonly selectors: SelectorDefsOf<J>;

  readonly selectorKeys: ReadonlyArray<string>;

  readonly reducers: ReducerDefsOf<J>;

  readonly reducerKeys: ReadonlyArray<string>;

  constructor(protected readonly juncture: J) {
    this.schema = this.juncture.schema[jSymbols.defPayload]();

    const junctureKeys = Object.keys(juncture);

    const selectors = this.getDefs(junctureKeys, DefKind.selector);
    this.selectors = selectors.map;
    this.selectorKeys = selectors.keys;

    const reducers = this.getDefs(junctureKeys, DefKind.reducer);
    this.reducers = reducers.map;
    this.reducerKeys = reducers.keys;
  }

  protected getDefs(junctureKeys: string[], kind: DefKind): { map: any, keys: string[] } {
    const juncture = this.juncture as any;
    const keys = junctureKeys.filter(key => isDef(juncture[key], kind));
    const map = mappedAssign({}, keys, key => juncture[key]);
    return { map, keys };
  }
}
