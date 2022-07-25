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
import { createFrame, Frame } from './frames/frame';
import {
  AccessorKit, prepareAccessorKit, preparePrivateAccessorKit, PrivateAccessorKit
} from './kits/accessor-kit';
import {
  BinKit, prepareBinKit, preparePrivateBinKit, PrivateBinKit
} from './kits/bin-kit';
import { preparePrivateFrameKit, PrivateFrameKit } from './kits/frame-kit';
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

  readonly frame!: Frame<Juncture>;

  readonly bins: BinKit<Juncture> = {} as any;

  protected readonly accessors: AccessorKit<Juncture> = {} as any;

  protected readonly privateFrames: PrivateFrameKit<Juncture> = {} as any;

  protected readonly privateBins: PrivateBinKit<Juncture> = {} as any;

  protected readonly privateAccessors: PrivateAccessorKit<Juncture> = {} as any;

  constructor(readonly juncture: J, config: CtxConfig) {
    this.schema = Juncture.getSchema(juncture);

    this.layout = config.layout;

    defineLazyProperty(this, 'cursor', () => this.createCursor());
    defineLazyProperty(this, 'privateCursor', () => this.createPrivateCursor());
    defineLazyProperty(this, 'frame', () => createFrame(this, this.accessors));

    prepareBinKit(this.bins, this.juncture, this.privateFrames);
    prepareAccessorKit(this.accessors, this);

    preparePrivateFrameKit(this.privateFrames, this, this.privateAccessors);
    preparePrivateBinKit(this.privateBins, this.juncture, this.privateFrames);
    preparePrivateAccessorKit(this.privateAccessors, this, this.privateBins);

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
