/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Schema } from '../definition/schema';
import { Juncture } from '../juncture';
import { CtxKernel } from './ctx-kernel';
import { Cursor } from './cursor';
import { Frame } from './frames/frame';
import { BinKit } from './kits/bin-kit';
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

export interface CtxResolver {
  (key: any): Ctx;
}

export interface Ctx {
  readonly juncture: Juncture;

  readonly schema: Schema;

  readonly layout: CtxLayout;

  readonly cursor: Cursor;

  readonly privateCursor: Cursor;

  readonly frame: Frame;

  readonly bins: BinKit;

  getValue(): any;
}

export class ConcreteCtx implements Ctx {
  readonly juncture: Juncture = this.kernel.juncture;

  readonly schema: Schema = this.kernel.schema;

  readonly layout: CtxLayout = this.kernel.layout;

  readonly cursor: Cursor = this.kernel.cursor;

  readonly privateCursor: Cursor = this.kernel.privateCursor;

  readonly frame: Frame = this.kernel.frame;

  readonly bins: BinKit = this.kernel.bins;

  constructor(protected readonly kernel: CtxKernel) { }

  getValue(): any {
    return this.kernel.getValue();
  }
}

// ---  Derivations
export interface CtxMap {
  readonly [key: string]: Ctx;
}
