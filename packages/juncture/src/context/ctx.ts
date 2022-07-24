/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, SchemaOf } from '../juncture';
import { defineLazyProperty } from '../util/object';
import { createCursor, Cursor } from './cursor';
import { Path } from './path';

// #region Layout & Config
export interface CtxLayout {
  readonly parent: Ctx | null;
  readonly path: Path;
  readonly isUnivocal: boolean;
  readonly isDivergent: boolean;
}

export interface CtxConfig {
  readonly layout: CtxLayout;
}
// #endregion

// #region Ctx
export class Ctx<J extends Juncture = Juncture> {
  readonly schema: SchemaOf<J>;

  readonly layout: CtxLayout;

  constructor(readonly juncture: J, config: CtxConfig) {
    this.schema = Juncture.getSchema(juncture);

    this.layout = config.layout;

    defineLazyProperty(this, 'cursor', () => this.createCursor());
    defineLazyProperty(this, 'privateCursor', () => this.createPrivateCursor());
  }

  protected createCursor(): Cursor<J> {
    return createCursor(this);
  }

  protected createPrivateCursor(): Cursor<J> {
    return this.cursor;
  }

  readonly cursor!: Cursor<J>;

  readonly privateCursor!: Cursor<J>;
}

// ---  Derivations
export type JunctureOfCtx<C extends Ctx> = C['juncture'];
// #endregion

// #region CtxMap
export interface CtxMap {
  readonly [key: string]: Ctx;
}
// #endregion
