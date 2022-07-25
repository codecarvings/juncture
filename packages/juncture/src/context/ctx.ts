/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  CursorOf, Juncture, PrivateCursorOf, SchemaOf
} from '../juncture';
import { jSymbols } from '../symbols';
import { defineLazyProperty } from '../util/object';
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
export class Ctx<J extends Juncture = Juncture> {
  readonly layout: CtxLayout;

  readonly schema: SchemaOf<J>;

  readonly cursor!: CursorOf<J>;

  protected readonly privateCursor!: PrivateCursorOf<J>;

  readonly frame!: Frame<J>;

  readonly bins: BinKit<J> = {} as any;

  protected readonly accessors: AccessorKit<J> = {} as any;

  protected readonly privateFrames: PrivateFrameKit<J> = {} as any;

  protected readonly privateBins: PrivateBinKit<J> = {} as any;

  protected readonly privateAccessors: PrivateAccessorKit<J> = {} as any;

  constructor(readonly juncture: J, config: CtxConfig) {
    this.layout = config.layout;

    this.schema = Juncture.getSchema(juncture) as any;

    this.getValue = this.getValue.bind(this);
    this.childCtxResolver = this.childCtxResolver.bind(this);

    defineLazyProperty(this, 'cursor', () => this.juncture[jSymbols.createCursor](this, this.childCtxResolver));
    defineLazyProperty(this, 'privateCursor', () => this.juncture[jSymbols.createPrivateCursor](
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

// ---  Derivations
export type JunctureOfCtx<C extends Ctx> = C['juncture'];
// #endregion

// #region CtxMap
export interface CtxMap {
  readonly [key: string]: Ctx;
}
// #endregion
