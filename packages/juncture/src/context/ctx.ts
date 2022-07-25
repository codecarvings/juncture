/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Schema } from '../definition/schema';
import { Juncture } from '../juncture';
import { defineLazyProperty } from '../util/object';
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

export interface CtxResolver {
  (key: any): Ctx;
}

// #region Ctx
export class Ctx {
  readonly schema: Schema;

  readonly layout: CtxLayout;

  readonly cursor!: any; // Cursor

  protected readonly privateCursor!: Cursor;

  readonly frame!: Frame;

  readonly bins: BinKit = {} as any;

  protected readonly accessors: AccessorKit = {} as any;

  protected readonly privateFrames: PrivateFrameKit = {} as any;

  protected readonly privateBins: PrivateBinKit = {} as any;

  protected readonly privateAccessors: PrivateAccessorKit = {} as any;

  constructor(readonly juncture: Juncture, config: CtxConfig) {
    this.schema = Juncture.getSchema(juncture);

    this.layout = config.layout;

    this.getValue = this.getValue.bind(this);
    this.childCtxResolver = this.childCtxResolver.bind(this);

    defineLazyProperty(this, 'cursor', () => Juncture.createCursor(this.juncture, this, this.childCtxResolver));
    defineLazyProperty(this, 'privateCursor', () => Juncture.createPrivateCursor(
      this.juncture,
      this,
      this.childCtxResolver
    ));
    defineLazyProperty(this, 'frame', () => createFrame(this, this.accessors));

    prepareBinKit(this.bins, this.juncture, this.privateFrames);
    prepareAccessorKit(this.accessors, this);

    preparePrivateFrameKit(this.privateFrames, this as any, this.privateAccessors);
    preparePrivateBinKit(this.privateBins, this.juncture, this.privateFrames);
    preparePrivateAccessorKit(this.privateAccessors, this, this.privateBins);
  }

  // eslint-disable-next-line class-methods-use-this
  protected childCtxResolver(key: any): Ctx {
    throw Error(`Unable to resolve child Ctx with key: ${key}`);
  }

  getValue(): any {
    // TODO: implement this
    return this.schema.defaultValue;
  }
}

// #endregion

// #region CtxMap
export interface CtxMap {
  readonly [key: string]: Ctx;
}
// #endregion
