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
import { Juncture } from './juncture';
import { SchemaOf } from './schema-host';
import { jSymbols } from './symbols';
import { mappedAssign } from './util/object';

interface DefBox<M> {
  readonly defs: M;
  readonly keys: ReadonlyArray<string>;
}

export class Driver<J extends Juncture> {
  readonly schema: SchemaOf<J>;

  readonly selector: DefBox<SelectorDefsOf<J>>;

  readonly reducer: DefBox<ReducerDefsOf<J>>;

  constructor(readonly juncture: J) {
    this.schema = this.juncture.schema[jSymbols.defPayload]();

    const junctureKeys = Object.keys(juncture);

    this.selector = this.getDefs(junctureKeys, DefKind.selector);

    this.reducer = this.getDefs(junctureKeys, DefKind.reducer);
  }

  protected getDefs(junctureKeys: string[], kind: DefKind): DefBox<any> {
    const juncture = this.juncture as any;
    const keys = junctureKeys.filter(key => isDef(juncture[key], kind));
    const defs = mappedAssign({}, keys, key => juncture[key]);
    return { defs, keys };
  }
}
