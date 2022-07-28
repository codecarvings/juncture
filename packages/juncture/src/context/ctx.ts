/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Schema } from '../definition/schema';
import { Juncture } from '../juncture';
import { jSymbols } from '../symbols';
import { defineLazyProperty } from '../util/object';
import { CtxHub } from './ctx-hub';
import { Cursor } from './cursor';
import { createFrame, Frame } from './frames/frame';
import {
  AccessorKit, prepareAccessorKit, preparePrivateAccessorKit, PrivateAccessorKit
} from './kits/accessor-kit';
import {
  BinKit, prepareBinKit, preparePrivateBinKit, PrivateBinKit
} from './kits/bin-kit';
import { preparePrivateFrameKit, PrivateFrameKit } from './kits/frame-kit';
import { Path } from './path';

export interface CtxLayout {
  readonly parent: Ctx | null;
  readonly path: Path;
  readonly isUnivocal: boolean;
  readonly isDivergent: boolean;
}

export interface CtxConfig {
  readonly layout: CtxLayout;
}

export class Ctx {
  readonly schema: Schema;

  readonly layout: CtxLayout;

  readonly cursor!: Cursor;

  readonly privateCursor!: Cursor;

  readonly frame!: Frame;

  readonly bins: BinKit = {} as any;

  protected readonly accessors: AccessorKit = {} as any;

  protected readonly privateFrames: PrivateFrameKit = {} as any;

  protected readonly privateBins: PrivateBinKit = {} as any;

  protected readonly privateAccessors: PrivateAccessorKit = {} as any;

  readonly hub: CtxHub;

  constructor(readonly juncture: Juncture, config: CtxConfig) {
    this.schema = Juncture.getSchema(juncture);

    this.layout = config.layout;

    defineLazyProperty(this, 'cursor', () => this.juncture[jSymbols.createCursor](this.hub));
    defineLazyProperty(this, 'privateCursor', () => this.juncture[jSymbols.createPrivateCursor](this.hub));
    defineLazyProperty(this, 'frame', () => createFrame(this, this.accessors));

    prepareBinKit(this.bins, this.juncture, this.privateFrames);
    prepareAccessorKit(this.accessors, this);

    preparePrivateFrameKit(this.privateFrames, this, this.privateAccessors);
    preparePrivateBinKit(this.privateBins, this.juncture, this.privateFrames);
    preparePrivateAccessorKit(this.privateAccessors, this, this.privateBins);

    this.getValue = this.getValue.bind(this);

    this.hub = this.juncture[jSymbols.createCtxHub](this, config);
  }

  getValue(): any {
    // TODO: implement this
    return this.schema.defaultValue;
  }
}

export interface CtxMap {
  readonly [key: string]: Ctx;
}
