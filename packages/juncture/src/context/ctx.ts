/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture, SchemaOf, ValueOf } from '../juncture';
import { defineLazyProperty } from '../util/object';
import { createCursor, Cursor } from './cursor';
import { AccessorKit, prepareAccessorKit } from './kits/accessor-kit';
import { BinKit, prepareBinKit } from './kits/bin-kit';
import { FrameKit, prepareFrameKit } from './kits/frame-kit';
import { preparePrivateBinKit, PrivateBinKit } from './kits/private-bin-kit';
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

  readonly cursor!: Cursor<J>;

  readonly privateCursor!: Cursor<J>;

  readonly bins: BinKit<Juncture> = {} as any;

  protected readonly privateBins: PrivateBinKit<Juncture> = {} as any;

  protected readonly accessors: AccessorKit<Juncture> = {} as any;

  protected readonly frames: FrameKit<Juncture> = {} as any;

  constructor(readonly juncture: J, config: CtxConfig) {
    this.schema = Juncture.getSchema(juncture);

    this.layout = config.layout;

    defineLazyProperty(this, 'cursor', () => this.createCursor());
    defineLazyProperty(this, 'privateCursor', () => this.createPrivateCursor());

    prepareBinKit(this.bins, this.juncture, this.frames);
    preparePrivateBinKit(this.privateBins, this.juncture, this.frames);
    prepareAccessorKit(this.accessors, this, this.privateBins);
    prepareFrameKit(this.frames, this.privateCursor, this.accessors);

    this.getValue = this.getValue.bind(this);
  }

  protected createCursor(): Cursor<J> {
    return createCursor(this);
  }

  protected createPrivateCursor(): Cursor<J> {
    return this.cursor;
  }

  getValue(): ValueOf<J> {
    // TODO: implement this
    return this.schema.defaultValue;
  }
}

// ---  Derivations
export type JunctureOfCtx<C extends Ctx> = C['juncture'];
// #endregion

// #region CtxMap
export interface CtxMap {
  readonly [key: string]: Ctx;
}
// #endregion
