/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  CursorOf, Juncture, SchemaOf, ValueOf
} from '../juncture';
import { jSymbols } from '../symbols';
import { defineLazyProperty } from '../util/object';
import { Ctx, CtxConfig, CtxLayout } from './ctx';
import { createFrame, Frame } from './frames/frame';
import {
  AccessorKit, prepareAccessorKit, preparePrivateAccessorKit, PrivateAccessorKit
} from './kits/accessor-kit';
import {
  BinKit, prepareBinKit, preparePrivateBinKit, PrivateBinKit
} from './kits/bin-kit';
import { preparePrivateFrameKit, PrivateFrameKit } from './kits/frame-kit';

export class CtxKernel<J extends Juncture = Juncture> {
  readonly schema: SchemaOf<J>;

  readonly layout: CtxLayout;

  readonly cursor!: CursorOf<J>;

  readonly privateCursor!: CursorOf<J>;

  readonly frame!: Frame<J>;

  readonly bins: BinKit<J> = {} as any;

  readonly accessors: AccessorKit<J> = {} as any;

  readonly privateFrames: PrivateFrameKit<J> = {} as any;

  readonly privateBins: PrivateBinKit<J> = {} as any;

  readonly privateAccessors: PrivateAccessorKit<J> = {} as any;

  constructor(readonly juncture: J, config: CtxConfig) {
    this.schema = Juncture.getSchema(juncture);

    this.layout = config.layout;

    defineLazyProperty(this, 'cursor', () => this.juncture[jSymbols.createCursor](this as any, this.childCtxResolver));
    defineLazyProperty(this, 'privateCursor', () => this.juncture[jSymbols.createPrivateCursor](
      this as any,
      this.childCtxResolver
    ));
    defineLazyProperty(this, 'frame', () => createFrame(this, this.accessors));

    prepareBinKit(this.bins, this.juncture, this.privateFrames);
    prepareAccessorKit(this.accessors, this as any);

    preparePrivateFrameKit(this.privateFrames, this, this.privateAccessors);
    preparePrivateBinKit(this.privateBins, this.juncture, this.privateFrames);
    preparePrivateAccessorKit(this.privateAccessors, this as any, this.privateBins);

    this.getValue = this.getValue.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  protected childCtxResolver(key: any): Ctx {
    throw Error(`Unable to resolve child Ctx with key: ${key}`);
  }

  getValue(): ValueOf<J> {
    // TODO: implement this
    return this.schema.defaultValue;
  }
}
